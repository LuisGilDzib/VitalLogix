package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
	/** Busca productos por coincidencia parcial en nombre (case-insensitive). */
	List<Product> findByNameContainingIgnoreCase(String name);

	/** Busca un producto por codigo de negocio (case-insensitive). */
	Optional<Product> findByCodeIgnoreCase(String code);

	/** Verifica si un codigo de negocio ya existe (case-insensitive). */
	boolean existsByCodeIgnoreCase(String code);

	/** Lista productos con stock mayor al valor enviado. */
	List<Product> findByStockGreaterThan(Integer stock);
}
