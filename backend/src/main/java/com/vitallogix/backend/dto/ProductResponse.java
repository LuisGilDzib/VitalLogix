package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String imageUrl;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private boolean requiresPrescription;
    private boolean visibleInSuggestions;
    private String promotionType;
    private Integer promoBuyQuantity;
    private Integer promoPayQuantity;
    private BigDecimal promoPercentDiscount;
    private LocalDateTime createdAt;
    private LocalDateTime expirationDate;

    public ProductResponse(Long id, String name, String code, String description, String imageUrl, String category, BigDecimal price, Integer stock, boolean requiresPrescription, boolean visibleInSuggestions, String promotionType, Integer promoBuyQuantity, Integer promoPayQuantity, BigDecimal promoPercentDiscount, LocalDateTime createdAt, LocalDateTime expirationDate) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.requiresPrescription = requiresPrescription;
        this.visibleInSuggestions = visibleInSuggestions;
        this.promotionType = promotionType;
        this.promoBuyQuantity = promoBuyQuantity;
        this.promoPayQuantity = promoPayQuantity;
        this.promoPercentDiscount = promoPercentDiscount;
        this.createdAt = createdAt;
        this.expirationDate = expirationDate;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public Integer getStock() { return stock; }
    public boolean isRequiresPrescription() { return requiresPrescription; }
    public boolean isVisibleInSuggestions() { return visibleInSuggestions; }
    public String getPromotionType() { return promotionType; }
    public Integer getPromoBuyQuantity() { return promoBuyQuantity; }
    public Integer getPromoPayQuantity() { return promoPayQuantity; }
    public BigDecimal getPromoPercentDiscount() { return promoPercentDiscount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
}
