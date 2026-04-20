package com.vitallogix.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, length = 60)
    private String code;


    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(length = 100)
    private String category;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private boolean requiresPrescription;

    @Column(nullable = true, columnDefinition = "boolean default true")
    private boolean visibleToUsers = true;

    @Column(nullable = true, columnDefinition = "boolean default true")
    private boolean visibleInSuggestions = true;

    @Column(length = 30)
    private String promotionType;

    @Column
    private Integer promoBuyQuantity;

    @Column
    private Integer promoPayQuantity;

    @Column(precision = 5, scale = 2)
    private BigDecimal promoPercentDiscount;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime expirationDate;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }


    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public boolean isRequiresPrescription() { return requiresPrescription; }
    public void setRequiresPrescription(boolean requiresPrescription) { this.requiresPrescription = requiresPrescription; }

    public boolean isVisibleToUsers() { return visibleToUsers; }
    public void setVisibleToUsers(boolean visibleToUsers) { this.visibleToUsers = visibleToUsers; }

    public boolean isVisibleInSuggestions() { return visibleInSuggestions; }
    public void setVisibleInSuggestions(boolean visibleInSuggestions) { this.visibleInSuggestions = visibleInSuggestions; }

    public String getPromotionType() { return promotionType; }
    public void setPromotionType(String promotionType) { this.promotionType = promotionType; }

    public Integer getPromoBuyQuantity() { return promoBuyQuantity; }
    public void setPromoBuyQuantity(Integer promoBuyQuantity) { this.promoBuyQuantity = promoBuyQuantity; }

    public Integer getPromoPayQuantity() { return promoPayQuantity; }
    public void setPromoPayQuantity(Integer promoPayQuantity) { this.promoPayQuantity = promoPayQuantity; }

    public BigDecimal getPromoPercentDiscount() { return promoPercentDiscount; }
    public void setPromoPercentDiscount(BigDecimal promoPercentDiscount) { this.promoPercentDiscount = promoPercentDiscount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }
}
