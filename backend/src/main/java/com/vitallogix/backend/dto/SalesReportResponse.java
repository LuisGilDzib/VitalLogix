package com.vitallogix.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesReportResponse(
    LocalDate date,
    BigDecimal totalSales,
    Integer totalTransactions
) {}
