package com.vitallogix.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ComboSuggestionRequest {

    @NotNull(message = "El presupuesto es obligatorio")
    @DecimalMin(value = "0.01", message = "El presupuesto debe ser mayor a 0")
    @DecimalMax(value = "10000.00", message = "El presupuesto maximo permitido es 10000.00")
    private BigDecimal budget;

    private List<Long> prioritizedProductIds = new ArrayList<>();

    @Min(value = 1, message = "El maximo de recomendaciones debe ser mayor a 0")
    private Integer maxRecommendations = 6;

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public List<Long> getPrioritizedProductIds() {
        return prioritizedProductIds;
    }

    public void setPrioritizedProductIds(List<Long> prioritizedProductIds) {
        this.prioritizedProductIds = prioritizedProductIds;
    }

    public Integer getMaxRecommendations() {
        return maxRecommendations;
    }

    public void setMaxRecommendations(Integer maxRecommendations) {
        this.maxRecommendations = maxRecommendations;
    }
}
