package com.vitallogix.backend.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles;

    @Column(name = "cliente_amigo_number", unique = true, length = 30)
    private String clienteAmigoNumber;

    @Column
    private Boolean friend = false;

    @Column(name = "purchases_since_coupon")
    private Integer purchasesSinceCoupon = 0;

    @Column(name = "coupon_used")
    private Boolean couponUsed = true;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public String getClienteAmigoNumber() { return clienteAmigoNumber; }
    public void setClienteAmigoNumber(String clienteAmigoNumber) { this.clienteAmigoNumber = clienteAmigoNumber; }
    public boolean isFriend() { return Boolean.TRUE.equals(friend); }
    public void setFriend(boolean friend) { this.friend = friend; }
    public Integer getPurchasesSinceCoupon() { return purchasesSinceCoupon; }
    public void setPurchasesSinceCoupon(Integer purchasesSinceCoupon) { this.purchasesSinceCoupon = purchasesSinceCoupon; }
    public boolean isCouponUsed() { return Boolean.TRUE.equals(couponUsed); }
    public void setCouponUsed(boolean couponUsed) { this.couponUsed = couponUsed; }
}
