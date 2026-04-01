package com.vitallogix.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class KnapsackRequest {
    @Min(value = 0, message = "La capacidad debe ser mayor o igual a 0")
    private int capacity;

    @NotEmpty(message = "Debes enviar al menos un item")
    @Valid
    private List<Item> items;

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public static class Item {
        @NotNull(message = "El id es obligatorio")
        private Long id;

        @NotNull(message = "El nombre es obligatorio")
        private String name;

        @Min(value = 0, message = "El peso debe ser mayor o igual a 0")
        private int weight;

        @Min(value = 0, message = "El valor debe ser mayor o igual a 0")
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
