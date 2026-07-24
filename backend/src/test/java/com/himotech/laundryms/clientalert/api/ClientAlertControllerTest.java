package com.himotech.laundryms.clientalert.api;

import java.util.UUID;

import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;
import com.himotech.laundryms.clientalert.service.ClientAlertService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ClientAlertController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
@DisplayName("ClientAlertController API Tests")
class ClientAlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClientAlertService clientAlertService;

    @Test
    @DisplayName("GET /api/v1/client-alerts - Should return 200 and paginated list")
    void listShouldreturn200Whenauthenticated() throws Exception {
        ClientAlertResponse resp = ClientAlertResponse.builder()
                .id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .orderId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .trackingNumber("LDR-20260215-1234")
                .customerId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .customerName("John Doe")
                .message("Your order LDR-20260215-1234 is ready for pickup.")
                .status("SENT")
                .build();

        Page<ClientAlertResponse> page = new PageImpl<>(List.of(resp));
        when(clientAlertService.search(any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/client-alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").exists())
                .andExpect(jsonPath("$.content[0].trackingNumber").value("LDR-20260215-1234"))
                .andExpect(jsonPath("$.content[0].status").value("SENT"));

        verify(clientAlertService).search(any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    @DisplayName("PATCH /api/v1/client-alerts/{id}/read - Should return 200")
    void markAsReadShouldreturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/client-alerts/123e4567-e89b-12d3-a456-426614174000/read")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(clientAlertService).markAsRead(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
    }

    @Test
    @DisplayName("PATCH /api/v1/client-alerts/read-all - Should return 200")
    void markAllAsReadShouldreturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/client-alerts/read-all")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(clientAlertService).markAllAsRead();
    }
}
