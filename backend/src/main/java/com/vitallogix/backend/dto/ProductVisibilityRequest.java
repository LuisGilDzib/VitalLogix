package com.vitallogix.backend.dto;

public class ProductVisibilityRequest {

    private Boolean visibleToUsers;
    private Boolean visibleInSuggestions;

    public Boolean getVisibleToUsers() {
        return visibleToUsers;
    }

    public void setVisibleToUsers(Boolean visibleToUsers) {
        this.visibleToUsers = visibleToUsers;
    }

    public Boolean getVisibleInSuggestions() {
        return visibleInSuggestions;
    }

    public void setVisibleInSuggestions(Boolean visibleInSuggestions) {
        this.visibleInSuggestions = visibleInSuggestions;
    }
}
