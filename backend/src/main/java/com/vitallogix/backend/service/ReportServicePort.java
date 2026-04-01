package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.ReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportServicePort {
    List<ReportResponse.SaleReport> getSalesReport(LocalDate from, LocalDate to);
    List<ReportResponse.InventoryReport> getInventoryReport();
}
