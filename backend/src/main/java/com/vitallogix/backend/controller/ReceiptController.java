package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ReceiptResponse;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.repository.SaleRepository;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    public ReceiptController(SaleRepository saleRepository, UserRepository userRepository) {
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{saleId}")
    public ReceiptResponse getReceipt(@PathVariable Long saleId) {
        Sale sale = saleRepository.findById(saleId).orElseThrow();
        Customer c = sale.getCustomer();

        // Use the values stored in the sale; they already include the discount if applicable.
        java.math.BigDecimal originalAmount = sale.getOriginalAmount() != null ? sale.getOriginalAmount() : sale.getTotalAmount();
        java.math.BigDecimal discountAmount = sale.getDiscountAmount() != null ? sale.getDiscountAmount() : java.math.BigDecimal.ZERO;

        List<ReceiptResponse.Item> items = sale.getItems().stream().map(item -> {
            java.math.BigDecimal subtotal = item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
            java.math.BigDecimal discountAmt;
            if (item.getCampaignName() != null && !item.getCampaignName().isEmpty()) {
                java.math.BigDecimal originalUnitPrice = item.getProduct().getPrice();
                java.math.BigDecimal discountPerUnit = originalUnitPrice.subtract(item.getUnitPrice());
                discountAmt = discountPerUnit.multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
            } else {
                discountAmt = java.math.BigDecimal.ZERO;
            }
            return new ReceiptResponse.Item(
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                subtotal,
                item.getCampaignName(),
                discountAmt
            );
        }).collect(Collectors.toList());

        Integer purchasesSinceCoupon = null;
        Integer purchasesToNextCoupon = null;
        String accountUsername = sale.getAccountUsername();
        if (accountUsername != null && !accountUsername.isBlank()) {
            purchasesSinceCoupon = userRepository.findByUsername(accountUsername)
                .map(user -> user.getPurchasesSinceCoupon() == null ? 0 : user.getPurchasesSinceCoupon())
                .orElse(null);
            if (purchasesSinceCoupon != null) purchasesToNextCoupon = Math.max(0, 5 - purchasesSinceCoupon);
        }

        return new ReceiptResponse(
            sale.getId(),
            sale.getSaleDate(),
            c != null ? c.getName() : null,
            c != null ? c.getAddress() : null,
            c != null ? c.getPhone() : null,
            items,
            originalAmount,
            discountAmount,
            sale.getTotalAmount(),
            sale.getLoyaltyAwardedCode(),
            purchasesSinceCoupon,
            purchasesToNextCoupon
        );
    }
}
