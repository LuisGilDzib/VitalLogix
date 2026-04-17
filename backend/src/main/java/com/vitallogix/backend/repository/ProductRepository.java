package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
	// Finds products by partial name match (case-insensitive).
	List<Product> findByNameContainingIgnoreCase(String name);

	// Finds a product by business code (case-insensitive).
	Optional<Product> findByCodeIgnoreCase(String code);

	// Checks whether a business code already exists (case-insensitive).
	boolean existsByCodeIgnoreCase(String code);

	// Lists products with stock greater than the provided value.
	List<Product> findByStockGreaterThan(Integer stock);

	// Lists products that are publicly visible for non-admin users.
	List<Product> findByVisibleToUsersTrue();
}
