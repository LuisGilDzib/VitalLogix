package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.SaleRequest;
import com.vitallogix.backend.exception.ResourceNotFoundException;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.SaleItem;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.SaleRepository;
import com.vitallogix.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository, CustomerRepository customerRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    // Creates a sale, decreases inventory, and applies the clienteamigo discount when applicable.
    @Transactional
    public Sale createSale(SaleRequest request) {
        Sale sale = new Sale();
        sale.setCustomer(resolveCustomer(request));
        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

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

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
        }

        sale.setItems(saleItems);
        sale.setTotalAmount(totalAmount);
        sale.setOriginalAmount(totalAmount);

        Customer customer = sale.getCustomer();
        if (customer != null && customer.isFriend()) {
            BigDecimal discount = totalAmount.multiply(BigDecimal.valueOf(0.10));
            sale.setDiscountAmount(discount);
            sale.setTotalAmount(totalAmount.subtract(discount));
        }

        Sale savedSale = saleRepository.save(sale);
        promoteToLoyaltyIfEligible(savedSale.getCustomer());
        return savedSale;
    }

    // Resolves the sale customer (existing by id/code or as a new record).
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
        if (!isBlank(customerData.getClienteAmigoNumber())) {
            customer = customerRepository.findByClienteAmigoNumber(customerData.getClienteAmigoNumber().trim()).orElse(null);
        }
        if (customer == null && !isBlank(customerData.getPhone())) {
            customer = customerRepository.findFirstByPhoneOrderByIdAsc(customerData.getPhone().trim()).orElse(null);
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
        customer.setFriend(customer.isFriend() || customerData.isFriend());

        if (!isBlank(customerData.getClienteAmigoNumber())) {
            customer.setClienteAmigoNumber(customerData.getClienteAmigoNumber().trim().toUpperCase(Locale.ROOT));
        }

        return customerRepository.save(customer);
    }

    // Promotes a customer to clienteamigo automatically once the purchase threshold is reached.
    private void promoteToLoyaltyIfEligible(Customer customer) {
        if (customer == null || customer.getId() == null) {
            return;
        }

        if (customer.isFriend() && !isBlank(customer.getClienteAmigoNumber())) {
            return;
        }

        long purchaseCount = saleRepository.countByCustomer_Id(customer.getId());
        if (purchaseCount < 5) {
            return;
        }

        customer.setFriend(true);
        if (isBlank(customer.getClienteAmigoNumber())) {
            customer.setClienteAmigoNumber(generateClienteAmigoCode());
        }
        customerRepository.save(customer);
    }

    // Generates a unique code in the CAM-XXXXXX format.
    private String generateClienteAmigoCode() {
        for (int i = 0; i < 20; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
            String code = "CAM-" + suffix;
            if (!customerRepository.existsByClienteAmigoNumberIgnoreCase(code)) {
                return code;
            }
        }
        throw new RuntimeException("No se pudo generar codigo clienteamigo unico");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
