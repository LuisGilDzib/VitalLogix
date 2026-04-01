package com.vitallogix.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(name = "cliente_amigo_number", unique = true, length = 30)
    private String clienteAmigoNumber;

    @Column(nullable = false)
    private boolean friend; // Programa de fidelización

    @OneToMany(mappedBy = "customer")
    private List<Sale> sales;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public List<Sale> getSales() { return sales; }
    public void setSales(List<Sale> sales) { this.sales = sales; }
}
