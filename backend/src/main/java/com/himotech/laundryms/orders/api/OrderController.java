package com.himotech.laundryms.orders.api;

import com.himotech.laundryms.api.dto.request.CreateOrderRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderStatusRequest;
import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.dto.response.OrderTrackingResponse;
import com.himotech.laundryms.api.mapper.OrderMapper;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.service.OrderService;
import com.himotech.laundryms.orders.service.OrderStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<OrderTrackingResponse> trackByReference(@PathVariable String referenceNumber) {
        Order order = orderService.findByReferenceNumber(referenceNumber);
        return ResponseEntity.ok(orderMapper.toTrackingResponse(order));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list() {
        List<Order> orders = orderService.findAll();
        return ResponseEntity.ok(orders.stream().map(orderMapper::toResponse).toList());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long orderId) {
        Order order = orderService.findById(orderId);
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