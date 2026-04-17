package com.vitallogix.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    // Loyalty program flag. Set to true when customer reaches 5+ purchases (auto-promoted) or manually assigned.
    // Grants 10% discount on all sales. Customer gets unique CAM-XXXXXX code when promoted.
    private boolean friend;

    // Bidirectional relationship: one customer can have multiple sales.
    // JsonIgnore prevents infinite serialization loop in API responses.
    @OneToMany(mappedBy = "customer")
    @JsonIgnore
    private List<Sale> sales;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // Returns unique loyalty program identifier (CAM-XXXXXX format).
    public String getClienteAmigoNumber() { return clienteAmigoNumber; }
    public void setClienteAmigoNumber(String clienteAmigoNumber) { this.clienteAmigoNumber = clienteAmigoNumber; }

    // Returns true if customer is in loyalty program (entitled to 10% discount).
    public boolean isFriend() { return friend; }
    public void setFriend(boolean friend) { this.friend = friend; }

    // Returns customer's purchase history.
    public List<Sale> getSales() { return sales; }
    public void setSales(List<Sale> sales) { this.sales = sales; }
}
