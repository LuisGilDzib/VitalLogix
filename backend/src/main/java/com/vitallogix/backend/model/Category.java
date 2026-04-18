package com.vitallogix.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEnum status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEnum type;

    @Column(nullable = true, columnDefinition = "boolean default true")
    // Controls visibility in product recommendations. Admin can toggle per category.
    // When false, products in this category won't appear in suggestion engine.
    private boolean visibleInSuggestions = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private String createdBy;

    @Column
    private String approvedBy;

    @Column
    // Timestamp of admin approval. Null if status != ACTIVE or still pending.
    private LocalDateTime approvedAt;

    // Auto-set creation and update timestamps on entity lifecycle.
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Update timestamp on every modification.
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Status enum: ACTIVE (visible), INACTIVE (hidden), PENDING_APPROVAL (custom categories awaiting admin review).
    public enum StatusEnum {
        ACTIVE,
        INACTIVE,
        PENDING_APPROVAL
    }

    // Type enum: PREDEFINED (system defaults), CUSTOM (user-created through API).
    public enum TypeEnum {
        PREDEFINED,
        CUSTOM
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StatusEnum getStatus() { return status; }
    public void setStatus(StatusEnum status) { this.status = status; }

    public TypeEnum getType() { return type; }
    public void setType(TypeEnum type) { this.type = type; }

    public boolean isVisibleInSuggestions() { return visibleInSuggestions; }
    public void setVisibleInSuggestions(boolean visibleInSuggestions) { this.visibleInSuggestions = visibleInSuggestions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
}
