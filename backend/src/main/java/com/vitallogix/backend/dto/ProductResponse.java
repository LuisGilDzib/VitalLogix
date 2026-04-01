package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private boolean requiresPrescription;
    private LocalDateTime createdAt;
    private LocalDateTime expirationDate;

    public ProductResponse(Long id, String name, String code, String description, String category, BigDecimal price, Integer stock, boolean requiresPrescription, LocalDateTime createdAt, LocalDateTime expirationDate) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.requiresPrescription = requiresPrescription;
        this.createdAt = createdAt;
        this.expirationDate = expirationDate;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public Integer getStock() { return stock; }
    public boolean isRequiresPrescription() { return requiresPrescription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
}
