package com.vitallogix.backend.dto;

public record CategoryRequest(
    String name,
    String description,
    Boolean visibleInSuggestions
) {}
