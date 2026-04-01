package com.vitallogix.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class KnapsackResponse {
    private int capacity;
    private int totalWeight;
    private int totalValue;
    private List<SelectedItem> selectedItems = new ArrayList<>();

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(int totalWeight) {
        this.totalWeight = totalWeight;
    }

    public int getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(int totalValue) {
        this.totalValue = totalValue;
    }

    public List<SelectedItem> getSelectedItems() {
        return selectedItems;
    }

    public void setSelectedItems(List<SelectedItem> selectedItems) {
        this.selectedItems = selectedItems;
    }

    public static class SelectedItem {
        private Long id;
        private String name;
        private int weight;
        private int value;

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

        public int getWeight() {
            return weight;
        }

        public void setWeight(int weight) {
            this.weight = weight;
        }

        public int getValue() {
            return value;
        }

        public void setValue(int value) {
            this.value = value;
        }
    }
}
