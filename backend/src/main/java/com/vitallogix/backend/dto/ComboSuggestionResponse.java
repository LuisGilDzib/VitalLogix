package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record ComboSuggestionResponse(
    BigDecimal prioritizedCost,
    BigDecimal recommendedCost,
    BigDecimal totalCost,
    int totalScore,
    String message,
    List<ComboItem> prioritizedItems,
    List<ComboItem> recommendedItems
) {
    public static record ComboItem(Long id, String name, BigDecimal price, Integer stock, int score) {}
}
