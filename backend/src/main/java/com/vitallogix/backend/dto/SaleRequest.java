package com.vitallogix.backend.dto;

import java.util.List;


public class SaleRequest {
    private List<SaleItemRequest> items;
    private Long customerId;
    private boolean prescription;
    private CustomerData customer;

    public List<SaleItemRequest> getItems() { return items; }
    public void setItems(List<SaleItemRequest> items) { this.items = items; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public boolean isPrescription() { return prescription; }
    public void setPrescription(boolean prescription) { this.prescription = prescription; }

    public CustomerData getCustomer() { return customer; }
    public void setCustomer(CustomerData customer) { this.customer = customer; }

    public static class CustomerData {
        private String name;
        private String address;
        private String phone;
        private boolean friend;
        private String clienteAmigoNumber;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public boolean isFriend() { return friend; }
        public void setFriend(boolean friend) { this.friend = friend; }
        public String getClienteAmigoNumber() { return clienteAmigoNumber; }
        public void setClienteAmigoNumber(String clienteAmigoNumber) { this.clienteAmigoNumber = clienteAmigoNumber; }
    }

    public static class SaleItemRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}