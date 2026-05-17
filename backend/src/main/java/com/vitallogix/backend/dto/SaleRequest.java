package com.vitallogix.backend.dto;

import java.util.List;

public record SaleRequest(
    List<SaleItemRequest> items,
    Long customerId,
    boolean prescription,
    CustomerData customer,
    String couponCode
) {
    // Legacy getters
    public List<SaleItemRequest> getItems() { return items(); }
    public Long getCustomerId() { return customerId(); }
    public boolean isPrescription() { return prescription(); }
    public CustomerData getCustomer() { return customer(); }
    public String getCouponCode() { return couponCode(); }

    public static record CustomerData(String name, String address, String phone, boolean friend, String clienteAmigoNumber) {
        public String getName() { return name(); }
        public String getAddress() { return address(); }
        public String getPhone() { return phone(); }
        public boolean isFriend() { return friend(); }
        public String getClienteAmigoNumber() { return clienteAmigoNumber(); }
    }

    public static record SaleItemRequest(Long productId, Integer quantity) {
        public Long getProductId() { return productId(); }
        public Integer getQuantity() { return quantity(); }
    }
}