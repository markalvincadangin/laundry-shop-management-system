package com.himotech.laundryms.reports.service;

import com.himotech.laundryms.api.dto.response.DailySalesReportResponse;
import com.himotech.laundryms.api.dto.response.PeriodSalesReportResponse;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<DailySalesReportResponse> getSalesTrend(LocalDate from, LocalDate to) {
        Instant fromInst = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInst = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        List<Object[]> trendData = paymentRepository.getSalesTrend(fromInst, toInst);
        
        return trendData.stream()
                .map(row -> DailySalesReportResponse.builder()
                        .date(LocalDate.parse(row[0].toString()))
                        .totalIncome(((BigDecimal) row[1]).doubleValue())
                        .paidOrdersCount(((Number) row[2]).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DailySalesReportResponse getDailySales(LocalDate date) {
        Instant from = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        BigDecimal totalIncome = Optional.ofNullable(paymentRepository.sumAmountPaidByPaymentDateBetween(from, to)).orElse(BigDecimal.ZERO);
        long count = paymentRepository.countByPaymentDateBetween(from, to);
        
        List<Object[]> methodData = paymentRepository.sumAmountPaidByPaymentMethodBetween(from, to);
        Map<String, Double> revenueByMethod = methodData.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> ((BigDecimal) row[1]).doubleValue()
                ));

        return DailySalesReportResponse.builder()
                .date(date)
                .totalIncome(totalIncome.doubleValue())
                .paidOrdersCount((int) count)
                .revenueByMethod(revenueByMethod)
                .build();
    }

    @Transactional(readOnly = true)
    public PeriodSalesReportResponse getMonthlySales(int year, int month) {
        Instant from = LocalDate.of(year, month, 1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = LocalDate.of(year, month, 1).plusMonths(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        BigDecimal totalIncome = Optional.ofNullable(paymentRepository.sumAmountPaidByPaymentDateBetween(from, to)).orElse(BigDecimal.ZERO);
        long count = paymentRepository.countByPaymentDateBetween(from, to);
        String period = String.format("%d-%02d", year, month);
        return PeriodSalesReportResponse.builder()
                .period(period)
                .totalIncome(totalIncome.doubleValue())
                .paidOrdersCount((int) count)
                .build();
    }

    @Transactional(readOnly = true)
    public PeriodSalesReportResponse getYearlySales(int year) {
        Instant from = LocalDate.of(year, 1, 1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = LocalDate.of(year, 1, 1).plusYears(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        BigDecimal totalIncome = Optional.ofNullable(paymentRepository.sumAmountPaidByPaymentDateBetween(from, to)).orElse(BigDecimal.ZERO);
        long count = paymentRepository.countByPaymentDateBetween(from, to);
        return PeriodSalesReportResponse.builder()
                .period(String.valueOf(year))
                .totalIncome(totalIncome.doubleValue())
                .paidOrdersCount((int) count)
                .build();
    }
}