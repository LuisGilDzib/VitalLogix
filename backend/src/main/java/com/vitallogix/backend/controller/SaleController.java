package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.SaleRequest;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.service.SaleService;
import com.vitallogix.backend.repository.SaleRepository; 
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;
    private final SaleRepository saleRepository;

    public SaleController(SaleService saleService, SaleRepository saleRepository) {
        this.saleService = saleService;
        this.saleRepository = saleRepository;
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale checkout(@Valid @RequestBody SaleRequest request, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return saleService.createSale(request, username);
    }

    @GetMapping
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}
