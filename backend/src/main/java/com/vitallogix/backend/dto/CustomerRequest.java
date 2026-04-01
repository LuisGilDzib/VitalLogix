package com.vitallogix.backend.dto;

public class CustomerRequest {
    private String name;
    private String address;
    private String phone;
    private String clienteAmigoNumber;
    private boolean friend;

    // Getters y Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getClienteAmigoNumber() { return clienteAmigoNumber; }
    public void setClienteAmigoNumber(String clienteAmigoNumber) { this.clienteAmigoNumber = clienteAmigoNumber; }
    public boolean isFriend() { return friend; }
    public void setFriend(boolean friend) { this.friend = friend; }
}
