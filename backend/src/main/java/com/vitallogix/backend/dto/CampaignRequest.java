package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public class CampaignRequest {
    private String name;
    private String description;
    private String promotionType;
    private Integer promoBuyQuantity;
    private Integer promoPayQuantity;
    private BigDecimal promoPercentDiscount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean isActive;
    private Set<Long> productIds;

    public CampaignRequest() {}

    public CampaignRequest(String name, String description, String promotionType,
                          Integer promoBuyQuantity, Integer promoPayQuantity,
                          BigDecimal promoPercentDiscount, LocalDateTime startDate,
                          LocalDateTime endDate, boolean isActive, Set<Long> productIds) {
        this.name = name;
        this.description = description;
        this.promotionType = promotionType;
        this.promoBuyQuantity = promoBuyQuantity;
        this.promoPayQuantity = promoPayQuantity;
        this.promoPercentDiscount = promoPercentDiscount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
        this.productIds = productIds;
    }

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPromotionType() { return promotionType; }
    public void setPromotionType(String promotionType) { this.promotionType = promotionType; }

    public Integer getPromoBuyQuantity() { return promoBuyQuantity; }
    public void setPromoBuyQuantity(Integer promoBuyQuantity) { this.promoBuyQuantity = promoBuyQuantity; }

    public Integer getPromoPayQuantity() { return promoPayQuantity; }
    public void setPromoPayQuantity(Integer promoPayQuantity) { this.promoPayQuantity = promoPayQuantity; }

    public BigDecimal getPromoPercentDiscount() { return promoPercentDiscount; }
    public void setPromoPercentDiscount(BigDecimal promoPercentDiscount) { this.promoPercentDiscount = promoPercentDiscount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Set<Long> getProductIds() { return productIds; }
    public void setProductIds(Set<Long> productIds) { this.productIds = productIds; }
}
