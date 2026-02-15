package com.himotech.laundryms.notification.api;

import com.himotech.laundryms.api.dto.response.NotificationResponse;
import com.himotech.laundryms.api.mapper.NotificationMapper;
import com.himotech.laundryms.exception.GlobalExceptionHandler;
import com.himotech.laundryms.notification.entity.Notification;
import com.himotech.laundryms.notification.repository.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NotificationController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
@DisplayName("NotificationController API Tests")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationRepository notificationRepository;

    @MockitoBean
    private NotificationMapper notificationMapper;

    @Test
    @DisplayName("GET /api/v1/notifications - Should return 200 and list")
    void list_ShouldReturn200_WhenAuthenticated() throws Exception {
        Notification n = Notification.builder()
                .id(1L)
                .message("Your order LDR-20260215-1234 is ready for pickup.")
                .build();
        NotificationResponse resp = NotificationResponse.builder()
                .id(1L)
                .orderId(10L)
                .referenceNumber("LDR-20260215-1234")
                .customerId(5L)
                .customerName("John Doe")
                .message("Your order LDR-20260215-1234 is ready for pickup.")
                .status("SENT")
                .build();

        when(notificationRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(n));
        when(notificationMapper.toResponse(n)).thenReturn(resp);

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].referenceNumber").value("LDR-20260215-1234"))
                .andExpect(jsonPath("$[0].status").value("SENT"));
    }
}
