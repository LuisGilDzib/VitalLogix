package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.SaleRequest;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale checkout(@Valid @RequestBody SaleRequest request) {
        return saleService.createSale(request);
    }
}
