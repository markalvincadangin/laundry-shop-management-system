package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.notification.NotificationService;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.entity.OrderStatusLog;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderStatusLogRepository;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * BR-OL-04: Allowed transitions per business-rules.md.
 * RECEIVED -> WASHING, CANCELLED
 * WASHING -> DRYING, CANCELLED
 * DRYING -> FOLDING, CANCELLED
 * FOLDING -> READY_FOR_PICKUP, CANCELLED
 * READY_FOR_PICKUP -> RELEASED, CANCELLED
 * RELEASED, CANCELLED -> (terminal)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderStatusService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.RECEIVED, Set.of(OrderStatus.WASHING, OrderStatus.CANCELLED),
            OrderStatus.WASHING, Set.of(OrderStatus.DRYING, OrderStatus.CANCELLED),
            OrderStatus.DRYING, Set.of(OrderStatus.FOLDING, OrderStatus.CANCELLED),
            OrderStatus.FOLDING, Set.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED),
            OrderStatus.READY_FOR_PICKUP, Set.of(OrderStatus.RELEASED, OrderStatus.CANCELLED),
            OrderStatus.RELEASED, Set.of(),
            OrderStatus.CANCELLED, Set.of()
    );
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderStatusLogRepository orderStatusLogRepository;
    private final NotificationService notificationService;

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus newStatus, UUID changedByUserId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        User changedBy = userRepository.findById(changedByUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + changedByUserId));

        if (newStatus == null) {
            throw new IllegalArgumentException("Invalid order status: " + newStatus);
        }

        if (newStatus.equals(order.getCurrentStatus())) {
            throw new IllegalArgumentException("New status cannot be the same as the current status");
        }

        // BR-OL-04: Validate allowed transition
        OrderStatus current = order.getCurrentStatus();
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new IllegalStateException(
                    "Invalid status transition: " + current + " -> " + newStatus
                            + ". Allowed: " + allowed);
        }

        if (newStatus == OrderStatus.RELEASED) {
            if (order.getCurrentStatus() != OrderStatus.READY_FOR_PICKUP) {
                throw new IllegalStateException(
                        "Order must be READY_FOR_PICKUP before release. Current status: " + order.getCurrentStatus()
                );
            }
            // BR-PAY-01 / To-Be Flow §3.3: Payment collected upon pickup; cannot release without payment
            if (order.getPaymentStatus() != PaymentStatus.PAID) {
                throw new IllegalStateException(
                        "Order must be paid before release. Record payment first. Current payment status: " + order.getPaymentStatus()
                );
            }
        }

        OrderStatus previousStatus = order.getCurrentStatus();
        order.setCurrentStatus(newStatus);
        orderRepository.save(order);

        log.info("Order status updated: Reference={}, {} → {}, ChangedBy={}", 
                order.getReferenceNumber(), previousStatus, newStatus, changedBy.getUsername());

        OrderStatusLog statusLog = OrderStatusLog.builder()
                .order(order)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .notes(notes)
                .build();
        orderStatusLogRepository.save(statusLog);

        // BR-NOTIF-01: Create notification when status → READY_FOR_PICKUP
        if (newStatus == OrderStatus.READY_FOR_PICKUP) {
            notificationService.createForReadyForPickup(order);
        }

        return order;
    }
}
