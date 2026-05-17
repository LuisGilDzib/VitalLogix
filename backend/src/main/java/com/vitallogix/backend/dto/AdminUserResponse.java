package com.vitallogix.backend.dto;

import com.vitallogix.backend.model.Role;

import java.util.Set;

public record AdminUserResponse(
    Long id,
    String username,
    Set<Role> roles,
    String clienteAmigoNumber,
    boolean couponAvailable,
    int purchasesSinceCoupon,
    long totalPurchaseCount
) {}
