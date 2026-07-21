package com.himotech.laundryms.orders.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.orders.dto.AddOnInput;
import com.himotech.laundryms.orders.dto.CreateOrderRequest;
import com.himotech.laundryms.orders.dto.OrderListParams;
import com.himotech.laundryms.orders.dto.UpdateOrderStatusRequest;
import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.dto.OrderResponse;
import com.himotech.laundryms.orders.dto.OrderTrackingResponse;
import com.himotech.laundryms.orders.mapper.OrderMapper;
import com.himotech.laundryms.orders.service.OrderService;
import com.himotech.laundryms.orders.service.OrderStatusService;
import com.himotech.laundryms.rates.entity.ServiceRate;
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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API tests for OrderController.
 * Validates: OpenAPI contract, request validation, response structure, HTTP status codes.
 */
@WebMvcTest(controllers = OrderController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
@DisplayName("OrderController API Tests")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private OrderStatusService orderStatusService;

    @MockitoBean
    private CustomerService customerService;

    @MockitoBean
    private OrderMapper orderMapper;

    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private Order sampleOrder() {
        Customer c = Customer.builder().id(java.util.UUID.randomUUID()).firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
        User u = User.builder().id(USER_ID).username("staff").build();
        ServiceRate r = ServiceRate.builder().id(java.util.UUID.randomUUID()).basePricePerLoad(BigDecimal.valueOf(120)).kgLimitPerLoad(BigDecimal.valueOf(8)).pricePerExtraMinute(BigDecimal.ONE).isActive(true).build();
        return Order.builder()
                .id(java.util.UUID.randomUUID())
                .referenceNumber("LDR-20260213-1234")
                .customer(c)
                .createdBy(u)
                .serviceRate(r)
                .weightKg(new BigDecimal("10.00"))
                .totalLoads(2)
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .extraMinutes(0)
                .baseAmount(new BigDecimal("240.00"))
                .extraMinutesAmount(BigDecimal.ZERO)
                .addonsTotalAmount(BigDecimal.ZERO)
                .grandTotal(new BigDecimal("240.00"))
                .currentStatus(OrderStatus.RECEIVED)
                .paymentStatus(PaymentStatus.UNPAID)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("POST /api/v1/orders")
    class CreateOrder {

        @Test
        @DisplayName("Should return 201 and OrderResponse when valid request")
        void createShouldreturn201Whenvalidrequest() throws Exception {
            CreateOrderRequest request = new CreateOrderRequest();
            request.setCustomerId(UUID.randomUUID());
            request.setCreatedByUserId(USER_ID);
            request.setWeightKg(new BigDecimal("10.00"));
            request.setExtraMinutes(0);

            Order order = sampleOrder();
            OrderResponse orderResp = OrderResponse.builder()
                    .id(java.util.UUID.randomUUID())
                    .referenceNumber("LDR-20260213-1234")
                    .customerId(UUID.randomUUID())
                    .weightKg(10.0)
                    .totalLoads(2)
                    .grandTotal(240.0)
                    .currentStatus("RECEIVED")
                    .paymentStatus("UNPAID")
                    .build();
            when(orderService.createFromRequest(any())).thenReturn(order);
            when(orderMapper.toResponse(order)).thenReturn(orderResp);

            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.referenceNumber").value("LDR-20260213-1234"))
                    .andExpect(jsonPath("$.customerId").value(1))
                    .andExpect(jsonPath("$.weightKg").value(10.0))
                    .andExpect(jsonPath("$.totalLoads").value(2))
                    .andExpect(jsonPath("$.grandTotal").value(240.0))
                    .andExpect(jsonPath("$.currentStatus").value("RECEIVED"))
                    .andExpect(jsonPath("$.paymentStatus").value("UNPAID"));

            verify(orderService).createFromRequest(any());
        }

        @Test
        @DisplayName("Should return 400 when weightKg is null")
        void createShouldreturn400Whenweightnull() throws Exception {
            CreateOrderRequest request = new CreateOrderRequest();
            request.setCustomerId(UUID.randomUUID());
            request.setCreatedByUserId(USER_ID);

            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Should return 400 when weightKg is zero")
        void createShouldreturn400Whenweightzero() throws Exception {
            CreateOrderRequest request = new CreateOrderRequest();
            request.setCustomerId(UUID.randomUUID());
            request.setCreatedByUserId(USER_ID);
            request.setWeightKg(BigDecimal.ZERO);

            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 when createdByUserId is null and no principal")
        void createShouldreturn401Whencreatedbyuseridnull() throws Exception {
            CreateOrderRequest request = new CreateOrderRequest();
            request.setCustomerId(UUID.randomUUID());
            request.setWeightKg(new BigDecimal("10.00"));

            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 404 when customer not found")
        void createShouldreturn404Whencustomernotfound() throws Exception {
            CreateOrderRequest request = new CreateOrderRequest();
            request.setCustomerId(UUID.randomUUID());
            request.setCreatedByUserId(USER_ID);
            request.setWeightKg(new BigDecimal("10.00"));

            when(orderService.createFromRequest(any())).thenThrow(new NotFoundException("Customer not found: 999"));

            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders")
    class ListOrders {

        @Test
        @DisplayName("Should return 200 and paginated orders")
        void listShouldreturn200Withorders() throws Exception {
            Order order = sampleOrder();
            OrderResponse orderResp = OrderResponse.builder().id(java.util.UUID.randomUUID()).referenceNumber("LDR-20260213-1234").build();
            Page<Order> page = new PageImpl<>(List.of(order), PageRequest.of(0, 20), 1);
            when(orderService.search(any(OrderListParams.class), any(Pageable.class))).thenReturn(page);
            when(orderMapper.toResponse(order)).thenReturn(orderResp);

            mockMvc.perform(get("/api/v1/orders"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].referenceNumber").value("LDR-20260213-1234"))
                    .andExpect(jsonPath("$.page").value(0))
                    .andExpect(jsonPath("$.size").value(20))
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.totalPages").value(1));

            verify(orderService).search(any(OrderListParams.class), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/{orderId}")
    class GetById {

        @Test
        @DisplayName("Should return 200 and OrderResponse when found")
        void getByIdShouldreturn200Whenfound() throws Exception {
            OrderResponse orderResp = OrderResponse.builder().id(java.util.UUID.randomUUID()).referenceNumber("LDR-20260213-1234").build();
            when(orderService.getOrderDetails(UUID.randomUUID())).thenReturn(orderResp);

            mockMvc.perform(get("/api/v1/orders/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.referenceNumber").value("LDR-20260213-1234"));

            verify(orderService).getOrderDetails(UUID.randomUUID());
        }

        @Test
        @DisplayName("Should return 404 when not found")
        void getByIdShouldreturn404Whennotfound() throws Exception {
            when(orderService.getOrderDetails(UUID.randomUUID())).thenThrow(new NotFoundException("Order not found: 999"));

            mockMvc.perform(get("/api/v1/orders/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/reference/{referenceNumber}")
    class TrackByReference {

        @Test
        @DisplayName("Should return 200 and OrderTrackingResponse when found")
        void trackByReferenceShouldreturn200Whenfound() throws Exception {
            Order order = sampleOrder();
            OrderTrackingResponse trackResp = OrderTrackingResponse.builder()
                    .referenceNumber("LDR-20260213-1234")
                    .currentStatus("RECEIVED")
                    .customerName("Juan Dela Cruz")
                    .paymentStatus("UNPAID")
                    .build();
            when(orderService.findByReferenceNumber("LDR-20260213-1234")).thenReturn(order);
            when(orderMapper.toTrackingResponse(order)).thenReturn(trackResp);

            mockMvc.perform(get("/api/v1/orders/reference/LDR-20260213-1234"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.referenceNumber").value("LDR-20260213-1234"))
                    .andExpect(jsonPath("$.currentStatus").value("RECEIVED"))
                    .andExpect(jsonPath("$.customerName").exists())
                    .andExpect(jsonPath("$.paymentStatus").value("UNPAID"));

            verify(orderService).findByReferenceNumber("LDR-20260213-1234");
        }

        @Test
        @DisplayName("Should return 404 when reference not found")
        void trackByReferenceShouldreturn404Whennotfound() throws Exception {
            when(orderService.findByReferenceNumber("INVALID")).thenThrow(new NotFoundException("Order not found for reference: INVALID"));

            mockMvc.perform(get("/api/v1/orders/reference/INVALID"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/orders/{orderId}/status")
    class UpdateStatus {

        @Test
        @DisplayName("Should return 200 and OrderResponse when valid transition")
        void updateStatusShouldreturn200Whenvalidtransition() throws Exception {
            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setNewStatus("WASHING");
            request.setChangedByUserId(USER_ID);

            Order order = sampleOrder();
            order.setCurrentStatus(OrderStatus.WASHING);
            OrderResponse orderResp = OrderResponse.builder().id(java.util.UUID.randomUUID()).currentStatus("WASHING").build();
            when(orderStatusService.updateStatus(eq(UUID.randomUUID()), eq(OrderStatus.WASHING), eq(USER_ID), any(), any())).thenReturn(order);
            when(orderMapper.toResponse(order)).thenReturn(orderResp);

            mockMvc.perform(patch("/api/v1/orders/1/status")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentStatus").value("WASHING"));

            verify(orderStatusService).updateStatus(eq(UUID.randomUUID()), eq(OrderStatus.WASHING), eq(USER_ID), any(), any());
        }

        @Test
        @DisplayName("Should return 400 when newStatus is blank")
        void updateStatusShouldreturn400Whennewstatusblank() throws Exception {
            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setNewStatus("  ");
            request.setChangedByUserId(USER_ID);

            mockMvc.perform(patch("/api/v1/orders/1/status")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 when changedByUserId is null and no principal")
        void updateStatusShouldreturn401Whenchangedbyuseridnull() throws Exception {
            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setNewStatus("WASHING");

            mockMvc.perform(patch("/api/v1/orders/1/status")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 404 when order not found")
        void updateStatusShouldreturn404Whenordernotfound() throws Exception {
            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setNewStatus("WASHING");
            request.setChangedByUserId(USER_ID);

            when(orderStatusService.updateStatus(eq(UUID.randomUUID()), any(), any(), any(), any()))
                    .thenThrow(new NotFoundException("Order not found: 999"));

            mockMvc.perform(patch("/api/v1/orders/999/status")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }
}
