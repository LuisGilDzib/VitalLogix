package com.vitallogix.backend.service;

import com.vitallogix.backend.model.Category;
import com.vitallogix.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all active categories. Used in catalog views and dropdown lists.
    public List<Category> getActiveCategories() {
        return categoryRepository.findByStatusOrderByNameAsc(Category.StatusEnum.ACTIVE);
    }

    // Get predefined system categories (e.g., Vitamins, Pain Relief).
    // These are created by admins during system setup and cannot be modified by users.
    public List<Category> getPredefinedCategories() {
        return categoryRepository.findByTypeOrderByNameAsc(Category.TypeEnum.PREDEFINED);
    }

    // Get custom user-created categories.
    // Note: Some may still be in PENDING_APPROVAL status waiting for admin review.
    public List<Category> getCustomCategories() {
        return categoryRepository.findByTypeOrderByNameAsc(Category.TypeEnum.CUSTOM);
    }

    // Get categories pending admin approval. Used in admin approval workflow.
    // These are custom categories awaiting verification before becoming visible to users.
    public List<Category> getPendingApprovals() {
        return categoryRepository.findPendingApprovals();
    }

    // Create predefined category (admin only, from backend setup).
    // Predefined categories are system defaults and automatically visible in suggestions.
    // Throws IllegalArgumentException if category name already exists.
    public Category createPredefinedCategory(String name, String description) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("La categoría '" + name + "' ya existe");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setType(Category.TypeEnum.PREDEFINED);
        category.setStatus(Category.StatusEnum.ACTIVE);
        category.setVisibleInSuggestions(true);
        category.setCreatedBy("SYSTEM");

        return categoryRepository.save(category);
    }

    // Create custom category from product form.
    // Custom categories start in PENDING_APPROVAL status and are invisible in suggestions until approved.
    // If category already exists and is ACTIVE, returns the existing one to avoid duplicates.
    public Category createCustomCategory(String name, String createdBy) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            Category existing = categoryRepository.findByNameIgnoreCase(name).orElse(null);
            if (existing != null && existing.getStatus() == Category.StatusEnum.ACTIVE) {
                return existing;
            }
        }

        Category category = new Category();
        category.setName(name);
        category.setType(Category.TypeEnum.CUSTOM);
        category.setStatus(Category.StatusEnum.PENDING_APPROVAL);
        category.setVisibleInSuggestions(false);
        category.setCreatedBy(createdBy);

        return categoryRepository.save(category);
    }

    // Approve category and activate it. Records admin ID and approval timestamp for audit trail.
    // Makes category visible in suggestions engine as part of approval workflow.
    // Throws RuntimeException if category not found.
    public Category approveCategory(Long id, String approvedBy) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        category.setStatus(Category.StatusEnum.ACTIVE);
        category.setApprovedBy(approvedBy);
        category.setApprovedAt(LocalDateTime.now());
        category.setVisibleInSuggestions(true);

        return categoryRepository.save(category);
    }

    // Reject and delete category. Used in admin approval workflow to discard unwanted custom categories.
    // Throws RuntimeException if category not found.
    public void rejectCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoryRepository.delete(category);
    }

    // Update category name and description.
    // Validates that new name is not already in use by another category (case-insensitive check).
    // Throws IllegalArgumentException if name conflicts, RuntimeException if category not found.
    public Category updateCategory(Long id, String name, String description) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        category.setName(name);
        category.setDescription(description);

        return categoryRepository.save(category);
    }

    public Category setCategorySuggestionVisibility(Long id, boolean visibleInSuggestions) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        category.setVisibleInSuggestions(visibleInSuggestions);
        return categoryRepository.save(category);
    }

    // Deactivate category (change status to INACTIVE). Keeps record in database for audit trail.
    // Inactive categories won't appear in user-facing views but remain queryable for admin reports.
    // Throws RuntimeException if category not found.
    public Category deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        category.setStatus(Category.StatusEnum.INACTIVE);
        return categoryRepository.save(category);
    }

    // Get category by ID. Returns Optional (empty if not found).
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Get all categories including inactive ones. Admin use case for full inventory review.
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
