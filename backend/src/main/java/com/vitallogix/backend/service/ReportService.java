package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.ReportResponse;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService implements ReportServicePort {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public ReportService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<ReportResponse.SaleReport> getSalesReport(LocalDate from, LocalDate to) {
        return saleRepository.findAll().stream()
                .filter(s -> !s.getSaleDate().toLocalDate().isBefore(from) && !s.getSaleDate().toLocalDate().isAfter(to))
                .collect(Collectors.groupingBy(s -> s.getSaleDate().toLocalDate()))
                .entrySet().stream().map(e -> {
                    ReportResponse.SaleReport r = new ReportResponse.SaleReport();
                    r.setDate(e.getKey());
                    r.setTotalSales(e.getValue().stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
                    r.setTotalTransactions(e.getValue().size());
                    return r;
                }).collect(Collectors.toList());
    }

    @Override
    public List<ReportResponse.InventoryReport> getInventoryReport() {
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
