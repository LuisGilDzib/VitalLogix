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

    // Obtener todas las categorías activas
    public List<Category> getActiveCategories() {
        return categoryRepository.findByStatusOrderByNameAsc(Category.StatusEnum.ACTIVE);
    }

    // Obtener categorías predefinidas
    public List<Category> getPredefinedCategories() {
        return categoryRepository.findByTypeOrderByNameAsc(Category.TypeEnum.PREDEFINED);
    }

    // Obtener categorías custom
    public List<Category> getCustomCategories() {
        return categoryRepository.findByTypeOrderByNameAsc(Category.TypeEnum.CUSTOM);
    }

    // Obtener categorías pendientes de aprobación
    public List<Category> getPendingApprovals() {
        return categoryRepository.findPendingApprovals();
    }

    // Crear categoría predefinida (solo admin, desde backend setup)
    public Category createPredefinedCategory(String name, String description) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("La categoría '" + name + "' ya existe");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setType(Category.TypeEnum.PREDEFINED);
        category.setStatus(Category.StatusEnum.ACTIVE);
        category.setCreatedBy("SYSTEM");

        return categoryRepository.save(category);
    }

    // Crear categoría custom (desde formulario de producto)
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
        category.setCreatedBy(createdBy);

        return categoryRepository.save(category);
    }

    // Aprobar categoría
    public Category approveCategory(Long id, String approvedBy) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        category.setStatus(Category.StatusEnum.ACTIVE);
        category.setApprovedBy(approvedBy);
        category.setApprovedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    // Rechazar categoría
    public void rejectCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoryRepository.delete(category);
    }

    // Actualizar categoría
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

    // Desactivar categoría
    public Category deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        category.setStatus(Category.StatusEnum.INACTIVE);
        return categoryRepository.save(category);
    }

    // Obtener categoría por ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Obtener todas las categorías (incluyendo inactivas)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
