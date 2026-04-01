package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ReportResponse;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.SaleRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public ReportController(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/sales")
    public List<ReportResponse.SaleReport> salesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return saleRepository.findAll().stream()
                .filter(s -> !s.getSaleDate().toLocalDate().isBefore(from) && !s.getSaleDate().toLocalDate().isAfter(to))
                .collect(Collectors.groupingBy(s -> s.getSaleDate().toLocalDate()))
                .entrySet().stream().map(e -> {
                    ReportResponse.SaleReport r = new ReportResponse.SaleReport();
                    r.setDate(e.getKey());
                    r.setTotalSales(e.getValue().stream().map(Sale::getTotalAmount).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
                    r.setTotalTransactions(e.getValue().size());
                    return r;
                }).collect(Collectors.toList());
    }

    @GetMapping("/inventory")
    public List<ReportResponse.InventoryReport> inventoryReport() {
        return productRepository.findAll().stream().map(p -> {
            ReportResponse.InventoryReport r = new ReportResponse.InventoryReport();
            r.setProductName(p.getName());
            r.setStock(p.getStock());
            r.setCategory(p.getCategory());
            r.setExpiration(p.getExpirationDate() != null ? p.getExpirationDate().toString() : "");
            return r;
        }).collect(Collectors.toList());
    }
}
