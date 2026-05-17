package com.vitallogix.backend.dto;

public record CustomerRequest(
    String name,
    String address,
    String phone,
    String clienteAmigoNumber,
    boolean friend
) {
    // Legacy getters for compatibility
    public String getName() { return name(); }
    public String getAddress() { return address(); }
    public String getPhone() { return phone(); }
    public String getClienteAmigoNumber() { return clienteAmigoNumber(); }
    public boolean isFriend() { return friend(); }
}
