package com.vitallogix.backend.dto;

import jakarta.validation.constraints.Min;

import java.util.ArrayList;
import java.util.List;

public class ComboSuggestionRequest {

    private List<Long> prioritizedProductIds = new ArrayList<>();

    @Min(value = 1, message = "El maximo de recomendaciones debe ser mayor a 0")
    private Integer maxRecommendations = 6;

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
