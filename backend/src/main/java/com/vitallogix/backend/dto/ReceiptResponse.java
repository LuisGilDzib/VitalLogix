package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReceiptResponse(
    Long saleId,
    LocalDateTime saleDate,
    String customerName,
    String customerAddress,
    String customerPhone,
    List<Item> items,
    BigDecimal totalAmount,
    BigDecimal discount,
    BigDecimal finalAmount,
    String loyaltyAwardedCode,
    Integer purchasesSinceCoupon,
    Integer purchasesToNextCoupon
) {
    public static record Item(
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        String campaignName,
        BigDecimal discountAmount
    ) {}
}
