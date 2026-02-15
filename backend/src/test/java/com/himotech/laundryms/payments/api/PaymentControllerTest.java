package com.himotech.laundryms.payments.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.api.dto.request.CreatePaymentRequest;
import com.himotech.laundryms.api.dto.response.PaymentResponse;
import com.himotech.laundryms.api.mapper.PaymentMapper;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.exception.ConflictException;
import com.himotech.laundryms.exception.GlobalExceptionHandler;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.service.PaymentService;
import com.himotech.laundryms.users.entity.User;
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
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API tests for PaymentController.
 * Validates: OpenAPI contract, request validation, response structure, HTTP status codes.
 */
@WebMvcTest(controllers = PaymentController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
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

    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private Payment samplePayment() {
        Order o = Order.builder().id(1L).referenceNumber("LDR-001").grandTotal(new BigDecimal("240.00")).build();
        User u = User.builder().id(USER_ID).username("staff").build();
        return Payment.builder()
                .id(1L)
                .order(o)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.CASH)
                .receivedBy(u)
                .paymentDate(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("POST /api/v1/payments")
    class CreatePayment {

        @Test
        @DisplayName("Should return 201 and PaymentResponse when valid request")
        void create_ShouldReturn201_WhenValidRequest() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(1L);
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setPaymentMethod(PaymentMethod.CASH);
            request.setReceivedByUserId(USER_ID);

            Payment payment = samplePayment();
            PaymentResponse paymentResp = PaymentResponse.builder()
                    .id(1L)
                    .orderId(1L)
                    .amountPaid(240.0)
                    .paymentMethod("CASH")
                    .paymentDate(payment.getPaymentDate().atOffset(java.time.ZoneOffset.UTC))
                    .build();
            when(paymentService.create(any())).thenReturn(payment);
            when(paymentMapper.toResponse(payment)).thenReturn(paymentResp);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.orderId").value(1))
                    .andExpect(jsonPath("$.amountPaid").value(240.0))
                    .andExpect(jsonPath("$.paymentMethod").value("CASH"))
                    .andExpect(jsonPath("$.paymentDate").exists());

            verify(paymentService).create(any());
        }

        @Test
        @DisplayName("Should return 400 when orderId is null")
        void create_ShouldReturn400_WhenOrderIdNull() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setReceivedByUserId(USER_ID);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Should return 400 when amountPaid is null")
        void create_ShouldReturn400_WhenAmountPaidNull() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(1L);
            request.setReceivedByUserId(USER_ID);

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when receivedByUserId is null")
        void create_ShouldReturn400_WhenReceivedByUserIdNull() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(1L);
            request.setAmountPaid(new BigDecimal("240.00"));

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 when order not found")
        void create_ShouldReturn404_WhenOrderNotFound() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(999L);
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setReceivedByUserId(USER_ID);

            when(paymentService.create(any())).thenThrow(new NotFoundException("Order not found: 999"));

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }

        @Test
        @DisplayName("Should return 409 when payment already exists (BR-PAY-02)")
        void create_ShouldReturn409_WhenPaymentAlreadyExists() throws Exception {
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.setOrderId(1L);
            request.setAmountPaid(new BigDecimal("240.00"));
            request.setReceivedByUserId(USER_ID);

            when(paymentService.create(any())).thenThrow(new ConflictException("Payment already recorded for this order"));

            mockMvc.perform(post("/api/v1/payments")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("CONFLICT"))
                    .andExpect(jsonPath("$.message").value("Payment already recorded for this order"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/payments/{paymentId}")
    class GetById {

        @Test
        @DisplayName("Should return 200 and PaymentResponse when found")
        void getById_ShouldReturn200_WhenFound() throws Exception {
            Payment payment = samplePayment();
            PaymentResponse paymentResp = PaymentResponse.builder().id(1L).orderId(1L).amountPaid(240.0).build();
            when(paymentService.findById(1L)).thenReturn(payment);
            when(paymentMapper.toResponse(payment)).thenReturn(paymentResp);

            mockMvc.perform(get("/api/v1/payments/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.orderId").value(1))
                    .andExpect(jsonPath("$.amountPaid").value(240.0));

            verify(paymentService).findById(1L);
        }

        @Test
        @DisplayName("Should return 404 when not found")
        void getById_ShouldReturn404_WhenNotFound() throws Exception {
            when(paymentService.findById(999L)).thenThrow(new NotFoundException("Payment not found: 999"));

            mockMvc.perform(get("/api/v1/payments/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }
}
