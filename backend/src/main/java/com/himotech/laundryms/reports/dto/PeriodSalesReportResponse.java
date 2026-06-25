package com.himotech.laundryms.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodSalesReportResponse {
    private String period;
    private Double totalIncome;
    private Integer paidOrdersCount;
}