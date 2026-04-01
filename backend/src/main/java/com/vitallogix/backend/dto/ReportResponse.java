package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportResponse {
    public static class SaleReport {
        private LocalDate date;
        private BigDecimal totalSales;
        private Integer totalTransactions;
        // Getters y setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public BigDecimal getTotalSales() { return totalSales; }
        public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
        public Integer getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(Integer totalTransactions) { this.totalTransactions = totalTransactions; }
    }
    public static class InventoryReport {
        private String productName;
        private Integer stock;
        private String category;
        private String expiration;
        // Getters y setters
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getExpiration() { return expiration; }
        public void setExpiration(String expiration) { this.expiration = expiration; }
    }
    private List<SaleReport> sales;
    private List<InventoryReport> inventory;
    // Getters y setters
    public List<SaleReport> getSales() { return sales; }
    public void setSales(List<SaleReport> sales) { this.sales = sales; }
    public List<InventoryReport> getInventory() { return inventory; }
    public void setInventory(List<InventoryReport> inventory) { this.inventory = inventory; }
}
