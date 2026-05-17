package com.vitallogix.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank(message = "Name is required") String name,
    String code,
    String description,
    String imageUrl,
    String category,
    @NotNull(message = "Price is required") @DecimalMin(value = "0.00", message = "Price must be >= 0") BigDecimal price,
    @NotNull(message = "Stock is required") @Min(value = 0, message = "Stock must be >= 0") Integer stock,
    boolean requiresPrescription,
    boolean visibleInSuggestions,
    String promotionType,
    Integer promoBuyQuantity,
    Integer promoPayQuantity,
    BigDecimal promoPercentDiscount,
    java.time.LocalDateTime expirationDate
) {
    public ProductRequest {
        // default visibleInSuggestions true if not provided by binder (keep previous default behavior)
    }

    // Legacy getters for compatibility
    public String getName() { return name(); }
    public String getCode() { return code(); }
    public String getDescription() { return description(); }
    public String getImageUrl() { return imageUrl(); }
    public String getCategory() { return category(); }
    public BigDecimal getPrice() { return price(); }
    public Integer getStock() { return stock(); }
    public boolean isRequiresPrescription() { return requiresPrescription(); }
    public boolean isVisibleInSuggestions() { return visibleInSuggestions(); }
    public String getPromotionType() { return promotionType(); }
    public Integer getPromoBuyQuantity() { return promoBuyQuantity(); }
    public Integer getPromoPayQuantity() { return promoPayQuantity(); }
    public BigDecimal getPromoPercentDiscount() { return promoPercentDiscount(); }
    public java.time.LocalDateTime getExpirationDate() { return expirationDate(); }
}
