package com.himotech.laundryms.payments.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.payments.dto.CreatePaymentRequest;
import com.himotech.laundryms.shared.dto.PageResponse;
import com.himotech.laundryms.payments.dto.PaymentResponse;
import com.himotech.laundryms.payments.mapper.PaymentMapper;
import com.himotech.laundryms.payments.PaymentMethod;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PaymentController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "ADMIN")
@DisplayName("PaymentController API Tests")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private PaymentMapper paymentMapper;

    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @Nested
    @DisplayName("POST /api/v1/payments")
    class CreatePayment {

        @Test
        @DisplayName("Should return 201 when valid request")
        void createShouldreturn201Whenvalid() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(UUID.randomUUID());
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setPaymentMethod(PaymentMethod.CASH);
            request.setReceivedByUserId(TEST_USER_ID);

            Payment payment = Payment.builder().id(java.util.UUID.randomUUID()).build();
            PaymentResponse response = PaymentResponse.builder()
                    .id(java.util.UUID.randomUUID())
                    .orderId(UUID.randomUUID())
                    .amountPaid(240.0)
                    .paymentMethod("CASH")
                    .build();

            when(paymentService.create(any())).thenReturn(payment);
            when(paymentMapper.toResponse(payment)).thenReturn(response);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.amountPaid").value(240.0));

            verify(paymentService).create(any());
        }

        @Test
        @DisplayName("Should return 400 when orderId is null")
        void createShouldreturn400Whenorderidnull() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setReceivedByUserId(TEST_USER_ID);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 when receivedByUserId is null and no principal")
        void createShouldreturn400Whenreceivedbyuseridnull() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(UUID.randomUUID());
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setPaymentMethod(PaymentMethod.CASH);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/payments")
    class ListPayments {

        @Test
        @DisplayName("Should return 200 and paginated list")
        void listShouldreturn200() throws Exception {
            Payment payment = Payment.builder().id(java.util.UUID.randomUUID()).build();
            PaymentResponse response = PaymentResponse.builder().id(java.util.UUID.randomUUID()).build();
            Page<Payment> page = new PageImpl<>(List.of(payment), PageRequest.of(0, 20), 1);

            when(paymentService.findAll(any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);
            when(paymentMapper.toResponse(payment)).thenReturn(response);

            mockMvc.perform(get("/api/v1/payments"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.totalElements").value(1));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/payments/{paymentId}")
    class GetById {
        @Test
        @DisplayName("Should return 200 when found")
        void getByIdShouldreturn200() throws Exception {
            Payment payment = Payment.builder().id(java.util.UUID.randomUUID()).build();
            PaymentResponse response = PaymentResponse.builder().id(java.util.UUID.randomUUID()).build();

            when(paymentService.findById(UUID.randomUUID())).thenReturn(payment);
            when(paymentMapper.toResponse(payment)).thenReturn(response);

            mockMvc.perform(get("/api/v1/payments/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        @DisplayName("Should return 404 when not found")
        void getByIdShouldreturn404() throws Exception {
            when(paymentService.findById(UUID.randomUUID())).thenThrow(new NotFoundException("Payment not found"));

            mockMvc.perform(get("/api/v1/payments/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
