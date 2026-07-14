package com.himotech.laundryms.rates.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.rates.dto.AddOnCatalogResponse;
import com.himotech.laundryms.rates.dto.CreateAddOnCatalogRequest;
import com.himotech.laundryms.rates.dto.UpdateAddOnCatalogRequest;
import com.himotech.laundryms.rates.service.AddOnCatalogService;
import com.himotech.laundryms.auth.JwtCookieAuthFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AddOnCatalogController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass security filters for unit test
class AddOnCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AddOnCatalogService service;

    @MockBean
    private JwtCookieAuthFilter jwtAuthenticationFilter; // mock to load context

    @Test
    @DisplayName("GET /api/v1/add-ons should return list of add-ons")
    void getAllAddOns() throws Exception {
        var response = AddOnCatalogResponse.builder()
                .id(1)
                .name("Rush Fee")
                .defaultPrice(new BigDecimal("50.00"))
                .isActive(true)
                .build();
        when(service.getAllActive()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/add-ons")
                .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Rush Fee"))
                .andExpect(jsonPath("$[0].defaultPrice").value(50.00));
    }

    @Test
    @DisplayName("POST /api/v1/add-ons should create add-on")
    @WithMockUser(roles = "ADMIN")
    void createAddOn() throws Exception {
        CreateAddOnCatalogRequest request = new CreateAddOnCatalogRequest();
        request.setName("New Addon");
        request.setDefaultPrice(new BigDecimal("10.00"));
        
        var response = AddOnCatalogResponse.builder()
                .id(1)
                .name("New Addon")
                .defaultPrice(new BigDecimal("10.00"))
                .isActive(true)
                .build();
        
        when(service.create(any(CreateAddOnCatalogRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/add-ons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Addon"));
    }

    @Test
    @DisplayName("PATCH /api/v1/add-ons/{id} should update add-on")
    @WithMockUser(roles = "ADMIN")
    void updateAddOn() throws Exception {
        UpdateAddOnCatalogRequest request = new UpdateAddOnCatalogRequest();
        request.setName("Updated");
        request.setDefaultPrice(new BigDecimal("15.00"));
        request.setIsActive(false);
        
        var response = AddOnCatalogResponse.builder()
                .id(1)
                .name("Updated")
                .defaultPrice(new BigDecimal("15.00"))
                .isActive(false)
                .build();
        
        when(service.update(eq(1), any(UpdateAddOnCatalogRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/add-ons/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }
}
