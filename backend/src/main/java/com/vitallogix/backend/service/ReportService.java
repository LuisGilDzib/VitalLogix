package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.InventoryReportResponse;
import com.vitallogix.backend.dto.SalesReportResponse;
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
    public List<SalesReportResponse> getSalesReport(LocalDate from, LocalDate to) {
        return saleRepository.findAll().stream()
                .filter(s -> !s.getSaleDate().toLocalDate().isBefore(from) && !s.getSaleDate().toLocalDate().isAfter(to))
                .collect(Collectors.groupingBy(s -> s.getSaleDate().toLocalDate()))
                .entrySet().stream().map(e -> new SalesReportResponse(
                        e.getKey(),
                        e.getValue().stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                        e.getValue().size()
                )).collect(Collectors.toList());
    }

    @Override
    public List<InventoryReportResponse> getInventoryReport() {
        return productRepository.findAll().stream().map(p -> new InventoryReportResponse(
                p.getName(),
                p.getStock(),
                p.getCategory(),
                p.getExpirationDate() != null ? p.getExpirationDate().toString() : ""
        )).collect(Collectors.toList());
    }
}
