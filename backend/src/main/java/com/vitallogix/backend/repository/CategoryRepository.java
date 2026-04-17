package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find category by name (case-insensitive). Useful for duplicate prevention during creation.
    Optional<Category> findByNameIgnoreCase(String name);

    // List all active categories ordered alphabetically. Used in catalog view and admin panels.
    List<Category> findByStatusOrderByNameAsc(Category.StatusEnum status);

    // List active categories that are visible in product suggestions. 
    // Critical for recommendation engine filtering - only suggests from visible categories.
    List<Category> findByStatusAndVisibleInSuggestionsTrueOrderByNameAsc(Category.StatusEnum status);

    // List categories by type (PREDEFINED or CUSTOM).
    // PREDEFINED: system default categories (e.g., Vitamins, Pain Relief)
    // CUSTOM: user-created categories with custom products
    List<Category> findByTypeOrderByNameAsc(Category.TypeEnum type);

    // List categories pending admin approval (status = PENDING_APPROVAL).
    // Ordered by creation date for FIFO review workflow.
    @Query("SELECT c FROM Category c WHERE c.status = 'PENDING_APPROVAL' ORDER BY c.createdAt ASC")
    List<Category> findPendingApprovals();

    // Check if a category with the given name already exists (case-insensitive).
    // Pre-validation to prevent duplicate categories in the system.
    boolean existsByNameIgnoreCase(String name);
}
