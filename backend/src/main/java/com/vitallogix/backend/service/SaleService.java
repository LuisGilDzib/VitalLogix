package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.SaleRequest;
import com.vitallogix.backend.exception.ResourceNotFoundException;
import com.vitallogix.backend.model.Campaign;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.SaleItem;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.observer.SaleEventNotifier;
import com.vitallogix.backend.repository.CampaignRepository;
import com.vitallogix.backend.repository.CustomerRepository;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.SaleRepository;
import com.vitallogix.backend.repository.UserRepository;
import com.vitallogix.backend.strategy.PromotionStrategy;
import com.vitallogix.backend.strategy.PromotionStrategyFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * SaleService demonstrates several SOLID principles and Design Patterns:
 * 1. SRP: Delegating pricing to Strategy, side effects to Observer, and data access to Repositories.
 * 2. OCP: Promotion logic is open for extension (via new strategies) but closed for modification.
 * 3. DIP: Depends on PromotionStrategy and SaleObserver abstractions.
 * 4. Strategy Pattern: Promotion calculations encapsulated in strategies.
 * 5. Observer Pattern: Notifying interested parties (like Loyalty) after sale completion.
 */
@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final SaleEventNotifier saleEventNotifier;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            CampaignRepository campaignRepository,
            UserRepository userRepository,
            SaleEventNotifier saleEventNotifier
    ) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.saleEventNotifier = saleEventNotifier;
    }

    @Transactional
    public Sale createSale(SaleRequest request, String username) {
        Sale sale = new Sale();
        sale.setAccountUsername(username);
        sale.setCustomer(resolveCustomer(request));
        User accountUser = resolveAccountUser(username);

        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal grossTotal = BigDecimal.ZERO;
        BigDecimal netTotal = BigDecimal.ZERO;

        for (SaleRequest.SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + itemRequest.getProductId()));

            validateSaleItem(product, itemRequest, request.isPrescription());

            // Update inventory
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setSale(sale);
            
            PricingBreakdown pricing = calculateLinePricing(product, itemRequest.getQuantity());
            item.setCampaignName(pricing.campaignName());
            
            if (pricing.campaignName() != null && itemRequest.getQuantity() > 0) {
                BigDecimal effectiveUnitPrice = pricing.net().divide(
                    BigDecimal.valueOf(itemRequest.getQuantity()), 2, RoundingMode.HALF_UP);
                item.setUnitPrice(effectiveUnitPrice);
            }
            
            saleItems.add(item);
            grossTotal = grossTotal.add(pricing.gross());
            netTotal = netTotal.add(pricing.net());
        }

        sale.setItems(saleItems);
        sale.setOriginalAmount(grossTotal);

        BigDecimal finalAmount = netTotal;
        BigDecimal totalDiscount = grossTotal.subtract(netTotal).max(BigDecimal.ZERO);

        String requestedCoupon = request.getCouponCode() == null ? "" : request.getCouponCode().trim().toUpperCase(Locale.ROOT);
        if (!requestedCoupon.isBlank()) {
            validateCouponOwnershipAndAvailability(accountUser, requestedCoupon);
            BigDecimal loyaltyDiscount = finalAmount.multiply(BigDecimal.valueOf(0.10));
            totalDiscount = totalDiscount.add(loyaltyDiscount);
            finalAmount = finalAmount.subtract(loyaltyDiscount);
            accountUser.setCouponUsed(true);
            userRepository.save(accountUser);
        }

        sale.setTotalAmount(finalAmount);
        sale.setDiscountAmount(totalDiscount);

        Sale savedSale = saleRepository.save(sale);
        
        // Notify observers (Observer Pattern)
        saleEventNotifier.notifyObservers(savedSale);
        
        return savedSale;
    }

    private void validateSaleItem(Product product, SaleRequest.SaleItemRequest itemRequest, boolean isPrescription) {
        if (product.isRequiresPrescription() && !isPrescription) {
            throw new RuntimeException("El producto '" + product.getName() + "' requiere receta medica");
        }
        if (product.getStock() < itemRequest.getQuantity()) {
            throw new RuntimeException("Stock insuficiente para: " + product.getName());
        }
    }

    private PricingBreakdown calculateLinePricing(Product product, int quantity) {
        BigDecimal unitPrice = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        BigDecimal gross = unitPrice.multiply(BigDecimal.valueOf(quantity));

        Campaign campaign = findActiveCampaign(product);
        
        String promotionType = "NONE";
        Integer buy = null;
        Integer pay = null;
        BigDecimal percent = null;
        String campaignName = null;

        if (campaign != null) {
            promotionType = campaign.getPromotionType();
            buy = campaign.getPromoBuyQuantity();
            pay = campaign.getPromoPayQuantity();
            percent = campaign.getPromoPercentDiscount();
            campaignName = campaign.getName();
        } else if (product.getPromotionType() != null) {
            promotionType = product.getPromotionType();
            buy = product.getPromoBuyQuantity();
            pay = product.getPromoPayQuantity();
            percent = product.getPromoPercentDiscount();
        }

        // Strategy Pattern in action:
        PromotionStrategy strategy = PromotionStrategyFactory.getInstance().getStrategy(promotionType);
        BigDecimal net = strategy.calculateNet(unitPrice, quantity, buy, pay, percent);

        return new PricingBreakdown(gross, net, campaignName);
    }

    private Campaign findActiveCampaign(Product product) {
        return campaignRepository.findActiveCampaignsAtTime(java.time.LocalDateTime.now())
                .stream()
                .filter(c -> c.getProducts().contains(product))
                .findFirst()
                .orElse(null);
    }

    private User resolveAccountUser(String username) {
        if (isBlank(username)) return null;
        return userRepository.findByUsername(username.trim()).orElse(null);
    }

    private Customer resolveCustomer(SaleRequest request) {
        boolean hasPrescription = request.getItems() != null && request.getItems().stream()
                .map(i -> productRepository.findById(i.getProductId()).orElse(null))
                .anyMatch(p -> p != null && p.isRequiresPrescription());

        if (!hasPrescription) return null;

        if (request.getCustomerId() != null) {
            return customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        SaleRequest.CustomerData data = request.getCustomer();
        if (data == null || isBlank(data.getName())) {
            throw new RuntimeException("Venta con receta requiere datos del cliente");
        }

        Customer customer = customerRepository.findFirstByPhoneOrderByIdAsc(data.getPhone())
                .orElseGet(() -> customerRepository.findFirstByNameOrderByIdAsc(data.getName())
                .orElse(new Customer()));

        customer.setName(data.getName());
        customer.setAddress(data.getAddress());
        customer.setPhone(data.getPhone());
        return customerRepository.save(customer);
    }

    private void validateCouponOwnershipAndAvailability(User accountUser, String requestedCoupon) {
        if (accountUser == null) throw new RuntimeException("Inicia sesion para usar cupones");
        if (isBlank(accountUser.getClienteAmigoNumber())) throw new RuntimeException("No tienes cupones");
        if (accountUser.isCouponUsed()) throw new RuntimeException("Cupon ya usado");
        if (!accountUser.getClienteAmigoNumber().equalsIgnoreCase(requestedCoupon)) throw new RuntimeException("Cupon invalido");
    }

    private record PricingBreakdown(BigDecimal gross, BigDecimal net, String campaignName) {}

    private boolean isBlank(String v) { return v == null || v.trim().isEmpty(); }
}

