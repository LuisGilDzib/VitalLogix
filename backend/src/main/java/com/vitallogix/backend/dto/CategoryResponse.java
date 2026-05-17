package com.vitallogix.backend.dto;

import java.time.LocalDateTime;

public record CategoryResponse(
    Long id,
    String name,
    String description,
    String status,
    String type,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String createdBy,
    String approvedBy,
    LocalDateTime approvedAt,
    boolean visibleInSuggestions
) {}
