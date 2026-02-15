package com.himotech.laundryms.reports.service;

import com.himotech.laundryms.api.dto.response.DailySalesReportResponse;
import com.himotech.laundryms.api.dto.response.PeriodSalesReportResponse;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DailySalesReportResponse getDailySales(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.plusDays(1).atStartOfDay();
        BigDecimal totalIncome = Optional.ofNullable(paymentRepository.sumAmountPaidByPaymentDateBetween(from, to)).orElse(BigDecimal.ZERO);
        long count = paymentRepository.countByPaymentDateBetween(from, to);
        return DailySalesReportResponse.builder()
                .date(date)
                .totalIncome(totalIncome.doubleValue())
                .paidOrdersCount((int) count)
                .build();
    }

    @Transactional(readOnly = true)
    public PeriodSalesReportResponse getMonthlySales(int year, int month) {
        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime to = from.plusMonths(1);
        BigDecimal totalIncome = paymentRepository.sumAmountPaidByPaymentDateBetween(from, to);
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
        LocalDateTime from = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to = from.plusYears(1);
        BigDecimal totalIncome = paymentRepository.sumAmountPaidByPaymentDateBetween(from, to);
        long count = paymentRepository.countByPaymentDateBetween(from, to);
        return PeriodSalesReportResponse.builder()
                .period(String.valueOf(year))
                .totalIncome(totalIncome.doubleValue())
                .paidOrdersCount((int) count)
                .build();
    }
}