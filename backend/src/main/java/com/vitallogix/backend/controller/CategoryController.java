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
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Obtener todas las categorías activas
    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<Category> categories = categoryService.getActiveCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Obtener categorías predefinidas
    @GetMapping("/predefined")
    public ResponseEntity<List<CategoryResponse>> getPredefinedCategories() {
        List<Category> categories = categoryService.getPredefinedCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Obtener categorías custom
    @GetMapping("/custom")
    public ResponseEntity<List<CategoryResponse>> getCustomCategories() {
        List<Category> categories = categoryService.getCustomCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Obtener categorías pendientes de aprobación (solo para admin)
    @GetMapping("/pending")
    public ResponseEntity<List<CategoryResponse>> getPendingApprovals() {
        List<Category> categories = categoryService.getPendingApprovals();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Obtener una categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok(mapToResponse(category)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtener todas las categorías (admin only)
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryResponse> responses = categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Crear categoría custom (desde formulario de producto)
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

    // Crear categoría predefinida (admin only, desde backend setup)
    @PostMapping("/predefined")
    public ResponseEntity<?> createPredefinedCategory(@RequestBody CategoryRequest request) {
        try {
            Category category = categoryService.createPredefinedCategory(request.getName(), request.getDescription());
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Aprobar categoría (admin only)
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

    // Rechazar categoría (admin only)
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<?> rejectCategory(@PathVariable Long id) {
        try {
            categoryService.rejectCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Actualizar categoría
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

    // Desactivar categoría
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        try {
            Category category = categoryService.deactivateCategory(id);
            return ResponseEntity.ok(mapToResponse(category));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Mapear Category a CategoryResponse
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
                category.getApprovedAt()
        );
    }

    // Clase interna para respuestas de error
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
