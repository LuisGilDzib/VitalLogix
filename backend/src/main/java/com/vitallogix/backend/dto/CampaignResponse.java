package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public record CampaignResponse(
    Long id,
    String name,
    String description,
    String promotionType,
    Integer promoBuyQuantity,
    Integer promoPayQuantity,
    BigDecimal promoPercentDiscount,
    LocalDateTime startDate,
    LocalDateTime endDate,
    boolean isActive,
    LocalDateTime createdAt,
    Set<Long> productIds
) {}
