package com.vitallogix.backend.dto;

import jakarta.validation.constraints.Min;
import java.util.ArrayList;
import java.util.List;

public record ComboSuggestionRequest(
    List<Long> prioritizedProductIds,
    @Min(value = 1, message = "El maximo de recomendaciones debe ser mayor a 0") Integer maxRecommendations
) {
    public ComboSuggestionRequest {
        if (prioritizedProductIds == null) prioritizedProductIds = new ArrayList<>();
        if (maxRecommendations == null) maxRecommendations = 6;
    }

    // Legacy getters for compatibility
    public List<Long> getPrioritizedProductIds() { return prioritizedProductIds(); }
    public Integer getMaxRecommendations() { return maxRecommendations(); }
}
