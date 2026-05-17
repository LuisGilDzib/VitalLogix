package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
    Long id,
    String name,
    String code,
    String description,
    String imageUrl,
    String category,
    BigDecimal price,
    Integer stock,
    boolean requiresPrescription,
    boolean visibleInSuggestions,
    String promotionType,
    Integer promoBuyQuantity,
    Integer promoPayQuantity,
    BigDecimal promoPercentDiscount,
    LocalDateTime createdAt,
    LocalDateTime expirationDate
) {}
