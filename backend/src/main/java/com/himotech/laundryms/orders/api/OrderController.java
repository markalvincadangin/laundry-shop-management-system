package com.himotech.laundryms.orders.api;

import com.himotech.laundryms.api.dto.request.CreateOrderRequest;
import com.himotech.laundryms.api.dto.request.OrderPreviewRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderStatusRequest;
import com.himotech.laundryms.api.dto.response.OrderPreviewResponse;
import com.himotech.laundryms.api.dto.response.OrderStatsResponse;
import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.dto.response.OrderTrackingResponse;
import com.himotech.laundryms.api.dto.response.PageResponse;
import com.himotech.laundryms.api.mapper.OrderMapper;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.service.OrderService;
import com.himotech.laundryms.orders.service.OrderStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderStatusService orderStatusService;
    private final OrderMapper orderMapper;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.createFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderMapper.toResponse(order));
    }

    @PostMapping("/preview")
    public ResponseEntity<OrderPreviewResponse> preview(@Valid @RequestBody OrderPreviewRequest request) {
        OrderPreviewResponse response = orderService.preview(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderStatsResponse> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(orderService.getStats(targetDate));
    }

    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<OrderTrackingResponse> trackByReference(@PathVariable String referenceNumber) {
        Order order = orderService.findByReferenceNumber(referenceNumber);
        return ResponseEntity.ok(orderMapper.toTrackingResponse(order));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100));
        Page<Order> ordersPage = orderService.findAll(status, paymentStatus, from, to, pageable);
        List<OrderResponse> content = ordersPage.getContent().stream()
                .map(orderMapper::toResponse)
                .toList();
        return ResponseEntity.ok(PageResponse.<OrderResponse>builder()
                .content(content)
                .page(ordersPage.getNumber())
                .size(ordersPage.getSize())
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .first(ordersPage.isFirst())
                .last(ordersPage.isLast())
                .build());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long orderId) {
        Order order = orderService.findById(orderId);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    @PatchMapping("/{orderId}")
    public ResponseEntity<OrderResponse> update(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderRequest request) {
        Order order = orderService.update(orderId, request);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderStatusService.updateStatus(
                orderId,
                OrderStatus.valueOf(request.getNewStatus()),
                request.getChangedByUserId(),
                request.getNotes()
        );
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }
}