package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Buscar por nombre (case-insensitive)
    Optional<Category> findByNameIgnoreCase(String name);

    // Listar todas las categorías activas
    List<Category> findByStatusOrderByNameAsc(Category.StatusEnum status);

    // Listar categorías por tipo (PREDEFINED o CUSTOM)
    List<Category> findByTypeOrderByNameAsc(Category.TypeEnum type);

    // Listar categorías pendientes de aprobación
    @Query("SELECT c FROM Category c WHERE c.status = 'PENDING_APPROVAL' ORDER BY c.createdAt ASC")
    List<Category> findPendingApprovals();

    // Verificar si existe una categoría con ese nombre
    boolean existsByNameIgnoreCase(String name);
}
