package com.himotech.laundryms.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesReportResponse {
    private LocalDate date;
    private Double totalIncome;
    private Integer paidOrdersCount;
    private Map<String, Double> revenueByMethod;
}