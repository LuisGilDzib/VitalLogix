package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ProductRequest;
import com.vitallogix.backend.dto.ProductResponse;
import com.vitallogix.backend.exception.ResourceNotFoundException;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        return toResponse(repository.save(product));
    }

    @Operation(summary = "product.update.summary", description = "product.update.description")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "product.update.ok"),
            @ApiResponse(responseCode = "404", description = "product.update.notfound"),
            @ApiResponse(responseCode = "400", description = "product.update.badrequest")
    })
    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        return toResponse(repository.save(product));
    }

    @Operation(summary = "product.delete.summary", description = "product.delete.description")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "product.delete.ok"),
            @ApiResponse(responseCode = "404", description = "product.delete.notfound")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        repository.deleteById(id);
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getCreatedAt()
        );
    }
}
