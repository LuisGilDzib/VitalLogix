package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.InventoryReportResponse;
import com.vitallogix.backend.dto.SalesReportResponse;
import com.vitallogix.backend.service.ReportServicePort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportServicePort reportService;

    public ReportController(ReportServicePort reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public List<SalesReportResponse> salesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.getSalesReport(from, to);
    }

    @GetMapping("/inventory")
    public List<InventoryReportResponse> inventoryReport() {
        return reportService.getInventoryReport();
    }
}
