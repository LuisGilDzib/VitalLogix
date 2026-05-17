package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.InventoryReportResponse;
import com.vitallogix.backend.dto.SalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportServicePort {
    List<SalesReportResponse> getSalesReport(LocalDate from, LocalDate to);
    List<InventoryReportResponse> getInventoryReport();
}
