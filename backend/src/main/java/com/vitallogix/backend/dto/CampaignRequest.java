package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public record CampaignRequest(
    String name,
    String description,
    String promotionType,
    Integer promoBuyQuantity,
    Integer promoPayQuantity,
    BigDecimal promoPercentDiscount,
    LocalDateTime startDate,
    LocalDateTime endDate,
    boolean active,
    Set<Long> productIds
) {}
