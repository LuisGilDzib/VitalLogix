package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ComboSuggestionResponse {

    private BigDecimal budget;
    private BigDecimal prioritizedCost;
    private BigDecimal recommendedCost;
    private BigDecimal totalCost;
    private int totalScore;
    private boolean budgetExceededByPrioritized;
    private String message;
    private List<ComboItem> prioritizedItems = new ArrayList<>();
    private List<ComboItem> recommendedItems = new ArrayList<>();

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getPrioritizedCost() {
        return prioritizedCost;
    }

    public void setPrioritizedCost(BigDecimal prioritizedCost) {
        this.prioritizedCost = prioritizedCost;
    }

    public BigDecimal getRecommendedCost() {
        return recommendedCost;
    }

    public void setRecommendedCost(BigDecimal recommendedCost) {
        this.recommendedCost = recommendedCost;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public boolean isBudgetExceededByPrioritized() {
        return budgetExceededByPrioritized;
    }

    public void setBudgetExceededByPrioritized(boolean budgetExceededByPrioritized) {
        this.budgetExceededByPrioritized = budgetExceededByPrioritized;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ComboItem> getPrioritizedItems() {
        return prioritizedItems;
    }

    public void setPrioritizedItems(List<ComboItem> prioritizedItems) {
        this.prioritizedItems = prioritizedItems;
    }

    public List<ComboItem> getRecommendedItems() {
        return recommendedItems;
    }

    public void setRecommendedItems(List<ComboItem> recommendedItems) {
        this.recommendedItems = recommendedItems;
    }

    public static class ComboItem {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer stock;
        private int score;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public Integer getStock() {
            return stock;
        }

        public void setStock(Integer stock) {
            this.stock = stock;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }
    }
}
