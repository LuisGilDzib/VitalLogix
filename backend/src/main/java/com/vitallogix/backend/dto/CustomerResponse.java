package com.vitallogix.backend.dto;

public record CustomerResponse(
    Long id,
    String name,
    String address,
    String phone,
    String clienteAmigoNumber,
    boolean friend,
    long purchaseCount
) {
    public CustomerResponse(Long id, String name, String address, String phone, String clienteAmigoNumber, boolean friend) {
        this(id, name, address, phone, clienteAmigoNumber, friend, 0);
    }
}
