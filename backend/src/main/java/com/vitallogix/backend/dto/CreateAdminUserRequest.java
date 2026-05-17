package com.vitallogix.backend.dto;

public record CreateAdminUserRequest(
    String username,
    String password
) {}
