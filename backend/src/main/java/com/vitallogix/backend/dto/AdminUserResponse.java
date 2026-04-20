package com.vitallogix.backend.dto;

import com.vitallogix.backend.model.Role;

import java.util.Set;

public class AdminUserResponse {
    private Long id;
    private String username;
    private Set<Role> roles;
    private String clienteAmigoNumber;
    private boolean couponAvailable;
    private int purchasesSinceCoupon;
    private long totalPurchaseCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public String getClienteAmigoNumber() {
        return clienteAmigoNumber;
    }

    public void setClienteAmigoNumber(String clienteAmigoNumber) {
        this.clienteAmigoNumber = clienteAmigoNumber;
    }

    public boolean isCouponAvailable() {
        return couponAvailable;
    }

    public void setCouponAvailable(boolean couponAvailable) {
        this.couponAvailable = couponAvailable;
    }

    public int getPurchasesSinceCoupon() {
        return purchasesSinceCoupon;
    }

    public void setPurchasesSinceCoupon(int purchasesSinceCoupon) {
        this.purchasesSinceCoupon = purchasesSinceCoupon;
    }

    public long getTotalPurchaseCount() {
        return totalPurchaseCount;
    }

    public void setTotalPurchaseCount(long totalPurchaseCount) {
        this.totalPurchaseCount = totalPurchaseCount;
    }
}
