package com.himotech.laundryms.rates.api;

import com.himotech.laundryms.exception.GlobalExceptionHandler;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.api.dto.response.ServiceRateResponse;
import com.himotech.laundryms.api.mapper.ServiceRateMapper;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import com.himotech.laundryms.rates.service.ServiceRateService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API tests for ServiceRatesController.
 * Validates: OpenAPI contract, response structure, HTTP status codes.
 */
@WebMvcTest(controllers = ServiceRatesController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
@DisplayName("ServiceRatesController API Tests")
class ServiceRatesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ServiceRateRepository serviceRateRepository;

    @MockitoBean
    private ServiceRateService serviceRateService;

    @MockitoBean
    private ServiceRateMapper serviceRateMapper;

    private ServiceRate sampleRate() {
        return ServiceRate.builder()
                .id(1)
                .serviceName("Standard Wash")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("GET /api/v1/service-rates")
    class ListRates {

        @Test
        @DisplayName("Should return 200 and array when activeOnly true")
        void list_ShouldReturn200_WhenActiveOnlyTrue() throws Exception {
            ServiceRate rate = sampleRate();
            ServiceRateResponse resp = ServiceRateResponse.builder()
                    .id(1)
                    .serviceName("Standard Wash")
                    .basePricePerLoad(120.0)
                    .kgLimitPerLoad(8.0)
                    .pricePerExtraMinute(1.0)
                    .isActive(true)
                    .build();
            when(serviceRateService.findAll(true)).thenReturn(List.of(rate));
            when(serviceRateMapper.toResponse(rate)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/service-rates").param("activeOnly", "true"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].serviceName").value("Standard Wash"))
                    .andExpect(jsonPath("$[0].basePricePerLoad").value(120.0))
                    .andExpect(jsonPath("$[0].kgLimitPerLoad").value(8.0))
                    .andExpect(jsonPath("$[0].pricePerExtraMinute").value(1.0))
                    .andExpect(jsonPath("$[0].isActive").value(true));

            verify(serviceRateService).findAll(true);
        }

        @Test
        @DisplayName("Should return 200 when activeOnly false")
        void list_ShouldReturn200_WhenActiveOnlyFalse() throws Exception {
            when(serviceRateRepository.findAll()).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/service-rates").param("activeOnly", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/service-rates/active")
    class GetActive {

        @Test
        @DisplayName("Should return 200 and ServiceRateResponse when active exists")
        void getActive_ShouldReturn200_WhenActiveExists() throws Exception {
            ServiceRate rate = sampleRate();
            ServiceRateResponse resp = ServiceRateResponse.builder().id(1).basePricePerLoad(120.0).kgLimitPerLoad(8.0).build();
            when(serviceRateService.getActiveRate()).thenReturn(rate);
            when(serviceRateMapper.toResponse(rate)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/service-rates/active"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.basePricePerLoad").value(120.0))
                    .andExpect(jsonPath("$.kgLimitPerLoad").value(8.0));

            verify(serviceRateService).getActiveRate();
        }

        @Test
        @DisplayName("Should return 404 when no active rate")
        void getActive_ShouldReturn404_WhenNoActiveRate() throws Exception {
            when(serviceRateService.getActiveRate()).thenThrow(new NotFoundException("No active service rate found."));

            mockMvc.perform(get("/api/v1/service-rates/active"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }
}
