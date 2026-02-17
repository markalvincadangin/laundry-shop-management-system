package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.common.enums.OrderStatus;
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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderStatusService {
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

        if (newStatus == OrderStatus.RELEASED && order.getCurrentStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException(
                    "Order must be READY_FOR_PICKUP before release. Current status: " + order.getCurrentStatus()
            );
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
