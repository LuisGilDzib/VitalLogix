package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.CategoryRequest;
import com.vitallogix.backend.dto.CategoryResponse;
import com.vitallogix.backend.model.Category;
import com.vitallogix.backend.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Get all active categories. Used in user-facing product catalog and dropdown lists.
    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<Category> categories = categoryService.getActiveCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get predefined system categories.
    @GetMapping("/predefined")
    public ResponseEntity<List<CategoryResponse>> getPredefinedCategories() {
        List<Category> categories = categoryService.getPredefinedCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get custom user-created categories.
    @GetMapping("/custom")
    public ResponseEntity<List<CategoryResponse>> getCustomCategories() {
        List<Category> categories = categoryService.getCustomCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get categories pending approval (admin only). Used in admin approval workflow.
    @GetMapping("/pending")
    public ResponseEntity<List<CategoryResponse>> getPendingApprovals() {
        List<Category> categories = categoryService.getPendingApprovals();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get single category by ID. Returns 404 if not found.
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok(mapToResponse(category)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all categories including inactive (admin only).
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Create custom category from product form.
    // X-User-ID header identifies the creator. Falls back to "ANONYMOUS" if not provided.
    @PostMapping("/custom")
    public ResponseEntity<?> createCustomCategory(@RequestBody CategoryRequest request,
                                                   @RequestHeader(value = "X-User-ID", required = false) String userId) {
        try {
            String createdBy = userId != null ? userId : "ANONYMOUS";
            Category category = categoryService.createCustomCategory(request.getName(), createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Create predefined category (admin only). Used during initial system setup.
    @PostMapping("/predefined")
    public ResponseEntity<?> createPredefinedCategory(@RequestBody CategoryRequest request) {
        try {
            Category category = categoryService.createPredefinedCategory(request.getName(), request.getDescription());
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Approve category and activate it (admin only). X-Admin-ID header identifies approver.
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveCategory(@PathVariable Long id,
                                             @RequestHeader(value = "X-Admin-ID", required = false) String adminId) {
        try {
            String approvedBy = adminId != null ? adminId : "ADMIN";
            Category category = categoryService.approveCategory(id, approvedBy);
            return ResponseEntity.ok(mapToResponse(category));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Reject and delete category (admin only). Used in approval workflow.
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<?> rejectCategory(@PathVariable Long id) {
        try {
            categoryService.rejectCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update category metadata. Validates name uniqueness.
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        try {
            Category category = categoryService.updateCategory(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    // Deactivate category (change status to INACTIVE).
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        try {
            Category category = categoryService.deactivateCategory(id);
            return ResponseEntity.ok(mapToResponse(category));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Toggle category visibility in product recommendations.
    // visibleInSuggestions field is required in request body.
    @PatchMapping("/{id}/suggestion-visibility")
    public ResponseEntity<?> setSuggestionVisibility(@PathVariable Long id, @RequestBody CategoryRequest request) {
        if (request.getVisibleInSuggestions() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("visibleInSuggestions es obligatorio"));
        }
        try {
            Category category = categoryService.setCategorySuggestionVisibility(id, request.getVisibleInSuggestions());
            return ResponseEntity.ok(mapToResponse(category));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    // Convert Category entity to response DTO. Includes all audit fields (createdAt, approvedAt) and visibility flags.
    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getStatus().toString(),
                category.getType().toString(),
                category.getCreatedAt(),
                category.getUpdatedAt(),
                category.getCreatedBy(),
                category.getApprovedBy(),
            category.getApprovedAt(),
            category.isVisibleInSuggestions()
        );
    }

    // Internal error response structure for API error messages.
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
