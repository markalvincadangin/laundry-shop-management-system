package com.himotech.laundryms.orders.api;

import com.himotech.laundryms.api.dto.request.CreateOrderRequest;
import com.himotech.laundryms.api.dto.request.OrderListParams;
import com.himotech.laundryms.api.dto.request.OrderPreviewRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderStatusRequest;
import com.himotech.laundryms.api.dto.response.OrderPreviewResponse;
import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.dto.response.OrderStatsResponse;
import com.himotech.laundryms.api.dto.response.OrderTrackingResponse;
import com.himotech.laundryms.api.dto.response.PageResponse;
import com.himotech.laundryms.api.mapper.OrderMapper;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.service.OrderService;
import com.himotech.laundryms.orders.service.OrderStatusService;
import com.himotech.laundryms.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for managing laundry orders.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    /**
     * Service for core order operations.
     */
    private final OrderService orderService;

    /**
     * Service for order status lifecycle transitions.
     */
    private final OrderStatusService orderStatusService;

    /**
     * Mapper for order DTOs.
     */
    private final OrderMapper orderMapper;

    /**
     * Creates a new laundry order.
     *
     * @param request   the order creation request
     * @param principal the authenticated user
     * @return the created order response
     */
    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @Valid @RequestBody final CreateOrderRequest request,
            @AuthenticationPrincipal final JwtPrincipal principal) {
        if (principal != null) {
            request.setCreatedByUserId(principal.userId());
        } else if (request.getCreatedByUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        final Order order = orderService.createFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderMapper.toResponse(order));
    }

    /**
     * Previews pricing for an order without creating it.
     *
     * @param request the preview request
     * @return the computed pricing preview
     */
    @PostMapping("/preview")
    public ResponseEntity<OrderPreviewResponse> preview(
            @Valid @RequestBody final OrderPreviewRequest request) {
        final OrderPreviewResponse response = orderService.preview(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets statistics for a given date.
     *
     * @param date the target date
     * @return the daily statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<OrderStatsResponse> getStats(
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            final LocalDate date) {
        final LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(orderService.getStats(targetDate));
    }

    /**
     * Tracks an order by its reference number.
     *
     * @param referenceNumber the unique order reference
     * @return the tracking response
     */
    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<OrderTrackingResponse> trackByReference(
            @PathVariable final String referenceNumber) {
        final Order order = orderService.findByReferenceNumber(referenceNumber);
        return ResponseEntity.ok(orderMapper.toTrackingResponse(order));
    }

    /**
     * Lists orders with pagination and filtering.
     *
     * @param params the search parameters
     * @return paginated list of orders
     */
    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> list(
            final OrderListParams params) {

        final Sort sort = params.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(params.getSortBy()).ascending().and(Sort.by("id").descending())
                : Sort.by(params.getSortBy()).descending().and(Sort.by("id").descending());

        final Pageable pageable = PageRequest.of(
                params.getPage(), Math.min(Math.max(params.getSize(), 1), 100), sort);
        
        final Page<Order> ordersPage = orderService.search(params, pageable);
        final List<OrderResponse> content = ordersPage.getContent().stream()
                .map(orderMapper::toResponse)
                .toList();

        final PageResponse<OrderResponse> pageResponse =
                PageResponse.<OrderResponse>builder()
                .content(content)
                .page(ordersPage.getNumber())
                .size(ordersPage.getSize())
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .first(ordersPage.isFirst())
                .last(ordersPage.isLast())
                .build();

        return ResponseEntity.ok(pageResponse);
    }

    /**
     * Gets full details of a specific order.
     *
     * @param orderId the order ID
     * @return the order details
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getById(
            @PathVariable final Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetails(orderId));
    }

    /**
     * Updates an order.
     *
     * @param orderId the order ID
     * @param request the update request
     * @return the updated order
     */
    @PatchMapping("/{orderId}")
    public ResponseEntity<OrderResponse> update(
            @PathVariable final Long orderId,
            @Valid @RequestBody final UpdateOrderRequest request) {
        final Order order = orderService.update(orderId, request);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    /**
     * Updates an order's lifecycle status.
     *
     * @param orderId   the order ID
     * @param request   the status update request
     * @param principal the authenticated user
     * @return the updated order
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable final Long orderId,
            @Valid @RequestBody final UpdateOrderStatusRequest request,
            @AuthenticationPrincipal final JwtPrincipal principal) {

        final UUID changedBy = principal != null
                ? principal.userId()
                : request.getChangedByUserId();

        if (changedBy == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        final Order order = orderStatusService.updateStatus(
                orderId,
                OrderStatus.valueOf(request.getNewStatus()),
                changedBy,
                request.getNotes()
        );
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    /**
     * Deletes an order (Admin only).
     *
     * @param orderId the order ID
     * @return a no-content response
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable final Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}