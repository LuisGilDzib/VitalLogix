package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ReceiptResponse {
    private Long saleId;
    private LocalDateTime saleDate;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private List<Item> items;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String loyaltyAwardedCode;
    private Integer purchasesSinceCoupon;
    private Integer purchasesToNextCoupon;

    public static class Item {
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String campaignName;
        private BigDecimal discountAmount;
        
        // Getters and setters
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getCampaignName() { return campaignName; }
        public void setCampaignName(String campaignName) { this.campaignName = campaignName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    }

    // Getters and setters
    public Long getSaleId() { return saleId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }
    public LocalDateTime getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDateTime saleDate) { this.saleDate = saleDate; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
    public String getLoyaltyAwardedCode() { return loyaltyAwardedCode; }
    public void setLoyaltyAwardedCode(String loyaltyAwardedCode) { this.loyaltyAwardedCode = loyaltyAwardedCode; }
    public Integer getPurchasesSinceCoupon() { return purchasesSinceCoupon; }
    public void setPurchasesSinceCoupon(Integer purchasesSinceCoupon) { this.purchasesSinceCoupon = purchasesSinceCoupon; }
    public Integer getPurchasesToNextCoupon() { return purchasesToNextCoupon; }
    public void setPurchasesToNextCoupon(Integer purchasesToNextCoupon) { this.purchasesToNextCoupon = purchasesToNextCoupon; }
}
