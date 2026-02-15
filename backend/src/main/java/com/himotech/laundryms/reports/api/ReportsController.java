package com.himotech.laundryms.reports.api;

import com.himotech.laundryms.api.dto.response.DailySalesReportResponse;
import com.himotech.laundryms.api.dto.response.PeriodSalesReportResponse;
import com.himotech.laundryms.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports/sales")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<DailySalesReportResponse> getDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailySales(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<PeriodSalesReportResponse> getMonthly(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlySales(year, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<PeriodSalesReportResponse> getYearly(@RequestParam int year) {
        return ResponseEntity.ok(reportService.getYearlySales(year));
    }
}