package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.SaleRequest;
import com.vitallogix.backend.exception.ResourceNotFoundException;
import com.vitallogix.backend.model.Campaign;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.SaleItem;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.CampaignRepository;
import com.vitallogix.backend.repository.CustomerRepository;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.SaleRepository;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            CampaignRepository campaignRepository,
            UserRepository userRepository
    ) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    // Creates a sale, decreases inventory and applies account-based loyalty discount.
    @Transactional
    public Sale createSale(SaleRequest request, String username) {
        Sale sale = new Sale();
        sale.setAccountUsername(username);
        sale.setCustomer(resolveCustomer(request));
        User accountUser = resolveAccountUser(username);

        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal grossAmount = BigDecimal.ZERO;
        BigDecimal promoAdjustedAmount = BigDecimal.ZERO;

        for (SaleRequest.SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemRequest.getProductId()));

            if (product.isRequiresPrescription() && !request.isPrescription()) {
                throw new RuntimeException("El producto '" + product.getName() + "' requiere receta medica");
            }

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName() +
                        " (Disponible: " + product.getStock() + ")");
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setSale(sale);
            saleItems.add(item);

            PricingBreakdown pricing = calculateLinePricing(product, itemRequest.getQuantity());
            grossAmount = grossAmount.add(pricing.gross());
            promoAdjustedAmount = promoAdjustedAmount.add(pricing.net());
        }

        sale.setItems(saleItems);
        sale.setOriginalAmount(grossAmount);

        BigDecimal totalAmount = promoAdjustedAmount;
        BigDecimal totalDiscount = grossAmount.subtract(promoAdjustedAmount).max(BigDecimal.ZERO);

        String requestedCoupon = request.getCouponCode() == null ? "" : request.getCouponCode().trim().toUpperCase(Locale.ROOT);
        if (!requestedCoupon.isBlank()) {
            validateCouponOwnershipAndAvailability(accountUser, requestedCoupon);
            BigDecimal discount = totalAmount.multiply(BigDecimal.valueOf(0.10));
            totalDiscount = totalDiscount.add(discount);
            totalAmount = totalAmount.subtract(discount);
            accountUser.setCouponUsed(true);
        }

        sale.setTotalAmount(totalAmount);

        sale.setDiscountAmount(totalDiscount);

        Sale savedSale = saleRepository.save(sale);
        String awardedCode = registerPurchaseAndMaybeIssueCoupon(accountUser, username);
        if (!isBlank(awardedCode)) {
            savedSale.setLoyaltyAwardedCode(awardedCode);
        }
        return savedSale;
    }

    private User resolveAccountUser(String username) {
        if (isBlank(username)) return null;
        return userRepository.findByUsername(username.trim()).orElse(null);
    }

    // Calculates per-line pricing after product-level promotions.
    private PricingBreakdown calculateLinePricing(Product product, int quantity) {
        BigDecimal unitPrice = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        BigDecimal gross = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal net = gross;

        // Check for active campaigns first (with date range validation)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        List<Campaign> activeCampaigns = campaignRepository.findActiveCampaignsAtTime(now);
        Campaign activeCampaign = activeCampaigns.stream()
                .filter(c -> c.getProducts().contains(product))
                .findFirst()
                .orElse(null);

        // Use campaign promotion if exists and is active, otherwise use product promotion
        String promotionType;
        Integer promoBuyQuantity;
        Integer promoPayQuantity;
        BigDecimal promoPercentDiscount;

        if (activeCampaign != null) {
            // Campaign takes priority over product promotion
            promotionType = activeCampaign.getPromotionType() == null
                    ? "NONE"
                    : activeCampaign.getPromotionType().trim().toUpperCase(Locale.ROOT);
            promoBuyQuantity = activeCampaign.getPromoBuyQuantity();
            promoPayQuantity = activeCampaign.getPromoPayQuantity();
            promoPercentDiscount = activeCampaign.getPromoPercentDiscount();
        } else {
            // Fall back to product-level promotion
            promotionType = product.getPromotionType() == null
                    ? "NONE"
                    : product.getPromotionType().trim().toUpperCase(Locale.ROOT);
            promoBuyQuantity = product.getPromoBuyQuantity();
            promoPayQuantity = product.getPromoPayQuantity();
            promoPercentDiscount = product.getPromoPercentDiscount();
        }

        if ("BUY_X_PAY_Y".equals(promotionType)) {
            Integer buy = promoBuyQuantity;
            Integer pay = promoPayQuantity;
            if (buy != null && pay != null && buy >= 2 && pay >= 1 && pay < buy && quantity >= buy) {
                int groups = quantity / buy;
                int remainder = quantity % buy;
                int payableUnits = (groups * pay) + remainder;
                net = unitPrice.multiply(BigDecimal.valueOf(payableUnits));
            }
        }

        if ("PERCENTAGE".equals(promotionType)) {
            BigDecimal percent = promoPercentDiscount;
            if (percent != null && percent.compareTo(BigDecimal.ZERO) > 0 && percent.compareTo(BigDecimal.valueOf(100)) < 0) {
                BigDecimal multiplier = BigDecimal.ONE.subtract(percent.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
                net = gross.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
            }
        }

        return new PricingBreakdown(gross, net);
    }

    private record PricingBreakdown(BigDecimal gross, BigDecimal net) {}

    // Resolves the sale customer as patient/contact data for receipts and prescription traceability.
    private Customer resolveCustomer(SaleRequest request) {
        if (request.getCustomerId() != null) {
            return customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        SaleRequest.CustomerData customerData = request.getCustomer();
        if (customerData == null) {
            if (request.isPrescription()) {
                throw new RuntimeException("La venta con receta requiere datos del cliente");
            }
            return null;
        }

        if (request.isPrescription()) {
            if (isBlank(customerData.getName()) || isBlank(customerData.getAddress()) || isBlank(customerData.getPhone())) {
                throw new RuntimeException("La venta con receta requiere nombre, direccion y telefono del cliente");
            }
        }

        Customer customer = null;
        if (!isBlank(customerData.getPhone())) {
            customer = customerRepository.findFirstByPhoneOrderByIdAsc(customerData.getPhone().trim()).orElse(null);
        }
        if (customer == null && !isBlank(customerData.getName())) {
            customer = customerRepository.findFirstByNameOrderByIdAsc(customerData.getName().trim()).orElse(null);
        }

        if (customer == null) {
            customer = new Customer();
        }

        if (!isBlank(customerData.getName())) {
            customer.setName(customerData.getName());
        }
        if (!isBlank(customerData.getAddress())) {
            customer.setAddress(customerData.getAddress());
        }
        if (!isBlank(customerData.getPhone())) {
            customer.setPhone(customerData.getPhone());
        }

        return customerRepository.save(customer);
    }

    private void validateCouponOwnershipAndAvailability(User accountUser, String requestedCoupon) {
        if (accountUser == null) {
            throw new RuntimeException("Debes iniciar sesion para aplicar cupones.");
        }

        if (isBlank(accountUser.getClienteAmigoNumber())) {
            throw new RuntimeException("Tu cuenta no tiene cupones disponibles.");
        }

        if (accountUser.isCouponUsed()) {
            throw new RuntimeException("Tu cupon ya fue utilizado. Acumula 5 compras para recibir otro.");
        }

        if (!accountUser.getClienteAmigoNumber().trim().equalsIgnoreCase(requestedCoupon)) {
            throw new RuntimeException("Ese cupon no pertenece a tu cuenta.");
        }
    }

    // Registers the purchase to the account counter and emits/replaces coupon every 5 purchases.
    private String registerPurchaseAndMaybeIssueCoupon(User accountUser, String username) {
        if (accountUser == null || isBlank(username)) {
            return null;
        }

        int nextCounter = (accountUser.getPurchasesSinceCoupon() == null ? 0 : accountUser.getPurchasesSinceCoupon()) + 1;

        if (nextCounter >= 5) {
            accountUser.setFriend(true);
            accountUser.setPurchasesSinceCoupon(0);
            accountUser.setClienteAmigoNumber(generateClienteAmigoCodeForAccount());
            accountUser.setCouponUsed(false);
            userRepository.save(accountUser);
            return accountUser.getClienteAmigoNumber();
        }

        accountUser.setPurchasesSinceCoupon(nextCounter);
        userRepository.save(accountUser);
        return null;
    }

    // Generates a unique code in CAM-XXXXXX format for account-based loyalty.
    private String generateClienteAmigoCodeForAccount() {
        for (int i = 0; i < 20; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
            String code = "CAM-" + suffix;
            if (!userRepository.existsByClienteAmigoNumberIgnoreCase(code)) {
                return code;
            }
        }
        throw new RuntimeException("No se pudo generar codigo clienteamigo unico para la cuenta");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
