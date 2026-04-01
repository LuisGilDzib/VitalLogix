package com.vitallogix.backend.dto;

public class CustomerResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String clienteAmigoNumber;
    private boolean friend;
    private long purchaseCount;

    public CustomerResponse(Long id, String name, String address, String phone, String clienteAmigoNumber, boolean friend) {
        this(id, name, address, phone, clienteAmigoNumber, friend, 0);
    }

    public CustomerResponse(Long id, String name, String address, String phone, String clienteAmigoNumber, boolean friend, long purchaseCount) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.clienteAmigoNumber = clienteAmigoNumber;
        this.friend = friend;
        this.purchaseCount = purchaseCount;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getClienteAmigoNumber() { return clienteAmigoNumber; }
    public boolean isFriend() { return friend; }
    public long getPurchaseCount() { return purchaseCount; }
}
