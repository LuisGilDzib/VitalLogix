package com.vitallogix.backend.dto;

public record InventoryReportResponse(
    String productName,
    Integer stock,
    String category,
    String expiration
) {}
