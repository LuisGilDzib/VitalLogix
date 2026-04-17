package com.vitallogix.backend.dto;

public class CategoryRequest {
    private String name;
    private String description;
    private Boolean visibleInSuggestions;

    // Constructores
    public CategoryRequest() {}

    public CategoryRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getVisibleInSuggestions() { return visibleInSuggestions; }
    public void setVisibleInSuggestions(Boolean visibleInSuggestions) { this.visibleInSuggestions = visibleInSuggestions; }
}
