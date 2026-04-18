package com.vitallogix.backend.dto;

public class ProductVisibilityRequest {

    private Boolean visibleInSuggestions;

    public Boolean getVisibleInSuggestions() {
        return visibleInSuggestions;
    }

    public void setVisibleInSuggestions(Boolean visibleInSuggestions) {
        this.visibleInSuggestions = visibleInSuggestions;
    }
}
