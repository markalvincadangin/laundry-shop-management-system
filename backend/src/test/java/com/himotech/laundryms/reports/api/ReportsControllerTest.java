package com.himotech.laundryms.reports.api;

import com.himotech.laundryms.reports.dto.DailySalesReportResponse;
import com.himotech.laundryms.reports.dto.PeriodSalesReportResponse;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;
import com.himotech.laundryms.reports.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API tests for ReportsController.
 * Validates: OpenAPI contract, response structure, HTTP status codes.
 */
@WebMvcTest(controllers = ReportsController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "OWNER")
@DisplayName("ReportsController API Tests")
class ReportsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    @Nested
    @DisplayName("GET /api/v1/reports/sales/daily")
    class GetDaily {

        @Test
        @DisplayName("Should return 200 and DailySalesReportResponse when valid date")
        void getDailyShouldreturn200Whenvaliddate() throws Exception {
            DailySalesReportResponse response = DailySalesReportResponse.builder()
                    .date(LocalDate.of(2026, 2, 13))
                    .totalIncome(1500.0)
                    .paidOrdersCount(5)
                    .build();
            when(reportService.getDailySales(LocalDate.of(2026, 2, 13))).thenReturn(response);

            mockMvc.perform(get("/api/v1/reports/sales/daily").param("date", "2026-02-13"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.date").value("2026-02-13"))
                    .andExpect(jsonPath("$.totalIncome").value(1500.0))
                    .andExpect(jsonPath("$.paidOrdersCount").value(5));

            verify(reportService).getDailySales(LocalDate.of(2026, 2, 13));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/reports/sales/monthly")
    class GetMonthly {

        @Test
        @DisplayName("Should return 200 and PeriodSalesReportResponse when valid year and month")
        void getMonthlyShouldreturn200Whenvalidparams() throws Exception {
            PeriodSalesReportResponse response = PeriodSalesReportResponse.builder()
                    .period("2026-02")
                    .totalIncome(12000.0)
                    .paidOrdersCount(50)
                    .build();
            when(reportService.getMonthlySales(2026, 2)).thenReturn(response);

            mockMvc.perform(get("/api/v1/reports/sales/monthly")
                            .param("year", "2026")
                            .param("month", "2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.period").value("2026-02"))
                    .andExpect(jsonPath("$.totalIncome").value(12000.0))
                    .andExpect(jsonPath("$.paidOrdersCount").value(50));

            verify(reportService).getMonthlySales(2026, 2);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/reports/sales/yearly")
    class GetYearly {

        @Test
        @DisplayName("Should return 200 and PeriodSalesReportResponse when valid year")
        void getYearlyShouldreturn200Whenvalidyear() throws Exception {
            PeriodSalesReportResponse response = PeriodSalesReportResponse.builder()
                    .period("2026")
                    .totalIncome(150000.0)
                    .paidOrdersCount(600)
                    .build();
            when(reportService.getYearlySales(2026)).thenReturn(response);

            mockMvc.perform(get("/api/v1/reports/sales/yearly").param("year", "2026"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.period").value("2026"))
                    .andExpect(jsonPath("$.totalIncome").value(150000.0))
                    .andExpect(jsonPath("$.paidOrdersCount").value(600));

            verify(reportService).getYearlySales(2026);
        }
    }
}
