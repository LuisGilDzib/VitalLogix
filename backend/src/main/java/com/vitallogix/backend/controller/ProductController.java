package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ProductRequest;
import com.vitallogix.backend.dto.ProductResponse;
import com.vitallogix.backend.dto.StockUpdateRequest;
import com.vitallogix.backend.exception.ResourceNotFoundException;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Products", description = "product.tag.description")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "product.list.summary", description = "product.list.description")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "product.list.ok")
    })
    @GetMapping
    public Page<ProductResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toResponse);
    }

    @Operation(summary = "product.get.summary", description = "product.get.description")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "product.get.ok"),
            @ApiResponse(responseCode = "404", description = "product.get.notfound")
    })
    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    @Operation(summary = "product.create.summary", description = "product.create.description")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "product.create.ok"),
            @ApiResponse(responseCode = "400", description = "product.create.badrequest")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        String requestedCode = normalizeCode(request.getCode());
        if (requestedCode == null) {
            product.setCode(generateUniqueCode(request.getName()));
        } else {
            if (repository.existsByCodeIgnoreCase(requestedCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El codigo de producto ya existe");
            }
            product.setCode(requestedCode);
        }
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setRequiresPrescription(request.isRequiresPrescription());
        product.setExpirationDate(request.getExpirationDate());
        return toResponse(repository.save(product));
    }

    @Operation(summary = "product.update.summary", description = "product.update.description")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "product.update.ok"),
            @ApiResponse(responseCode = "404", description = "product.update.notfound"),
            @ApiResponse(responseCode = "400", description = "product.update.badrequest")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product product = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setName(request.getName());
        String requestedCode = normalizeCode(request.getCode());
        if (requestedCode != null) {
            Product existing = repository.findByCodeIgnoreCase(requestedCode).orElse(null);
            if (existing != null && !existing.getId().equals(product.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El codigo de producto ya existe");
            }
            product.setCode(requestedCode);
        } else if (normalizeCode(product.getCode()) == null) {
            product.setCode(generateUniqueCode(request.getName()));
        }
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setRequiresPrescription(request.isRequiresPrescription());
        product.setExpirationDate(request.getExpirationDate());
        return toResponse(repository.save(product));
    }

    @Operation(summary = "product.delete.summary", description = "product.delete.description")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "product.delete.ok"),
            @ApiResponse(responseCode = "404", description = "product.delete.notfound")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar el producto porque tiene ventas asociadas"
            );
        }
    }

        @Operation(summary = "product.restock.summary", description = "product.restock.description")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "product.restock.ok"),
            @ApiResponse(responseCode = "404", description = "product.restock.notfound")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @PatchMapping("/{id}/stock")
        public ProductResponse addStock(@PathVariable Long id, @Valid @RequestBody StockUpdateRequest request) {
        Product product = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStock(product.getStock() + request.getQuantity());
        return toResponse(repository.save(product));
        }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
            p.getId(),
            p.getName(),
            p.getCode(),
            p.getDescription(),
            p.getCategory(),
            p.getPrice(),
            p.getStock(),
            p.isRequiresPrescription(),
            p.getCreatedAt(),
            p.getExpirationDate()
        );
    }

    /**
     * Busca productos por prioridad de filtro: id, código, nombre o categoría.
     */
    @GetMapping("/search")
    public java.util.List<ProductResponse> search(@RequestParam(required = false) String name,
                                        @RequestParam(required = false) Long id,
                                        @RequestParam(required = false) String code,
                                        @RequestParam(required = false) String category) {
        java.util.List<Product> products = new java.util.ArrayList<>();
        if (id != null) {
            repository.findById(id).ifPresent(products::add);
        } else if (code != null) {
            repository.findByCodeIgnoreCase(code).ifPresent(products::add);
        } else if (name != null) {
            products = repository.findByNameContainingIgnoreCase(name);
        } else if (category != null) {
            products = repository.findAll().stream()
                .filter(p -> category != null && category.equalsIgnoreCase(p.getCategory()))
                .toList();
        }
        return products.stream().map(this::toResponse).toList();
    }

    private String normalizeCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String generateUniqueCode(String productName) {
        String base = "MED";
        if (productName != null && !productName.trim().isEmpty()) {
            String normalized = productName.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "");
            if (!normalized.isEmpty()) {
                base = normalized.substring(0, Math.min(4, normalized.length()));
            }
        }

        for (int i = 0; i < 20; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
            String candidate = base + "-" + suffix;
            if (!repository.existsByCodeIgnoreCase(candidate)) {
                return candidate;
            }
        }

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar codigo unico");
    }
}
