package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.clientalert.service.ClientAlertService;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.settings.service.SystemSettingsService;
import com.himotech.laundryms.machines.repository.MachineRepository;
import com.himotech.laundryms.machines.entity.Machine;
import java.util.List;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ClientAlertService clientAlertService;
    private final SystemSettingsService systemSettingsService;
    private final MachineRepository machineRepository;

    @Auditable(action = "ORDER_STATUS_UPDATE", description = "Update order lifecycle status")
    @Transactional
    public Order updateStatus(UUID orderId, OrderStatus newStatus, UUID changedByUserId, String notes, Set<Long> machineIds) {
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

        if (newStatus == OrderStatus.WASHING || newStatus == OrderStatus.DRYING) {
            if (systemSettingsService.getSettings().isSystemPaused()) {
                throw new IllegalStateException("System is currently paused due to power interruption. Cannot transition to " + newStatus);
            }
            if (machineIds == null || machineIds.isEmpty()) {
                throw new IllegalArgumentException("At least one machine must be assigned when transitioning to " + newStatus);
            }
            if (machineIds.size() > order.getTotalLoads()) {
                throw new IllegalArgumentException("Cannot assign more machines (" + machineIds.size() + ") than the total number of loads (" + order.getTotalLoads() + ")");
            }
            if (machineIds.size() > 10) {
                throw new IllegalArgumentException("Cannot assign more than 10 machines to a single order");
            }
            
            long conflicts = orderRepository.countConflictingMachines(machineIds, List.of(OrderStatus.WASHING, OrderStatus.DRYING), orderId);
            if (conflicts > 0) {
                throw new IllegalStateException("One or more selected machines are currently assigned to another active order in WASHING or DRYING state.");
            }
            
            List<Machine> machines = machineRepository.findAllById(machineIds);
            if (machines.size() != machineIds.size()) {
                throw new IllegalArgumentException("One or more selected machines do not exist.");
            }
            
            for (Machine m : machines) {
                if (!"OPERATIONAL".equals(m.getStatus().name()) || !m.getIsActive()) {
                    throw new IllegalStateException("Machine " + m.getName() + " is not available for assignment.");
                }
            }
            order.setAssignedMachines(new HashSet<>(machines));
        } else if (newStatus == OrderStatus.READY_FOR_PICKUP || newStatus == OrderStatus.CANCELLED) {
             // Clear machines once done
             order.getAssignedMachines().clear();
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

        // Financial Integrity: If order is cancelled, void the payment so it doesn't count as revenue
        if (newStatus == OrderStatus.CANCELLED) {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {  // BR-PAY-07
                order.setPaymentStatus(PaymentStatus.VOIDED);
            }
        }

        orderRepository.save(order);

        log.info("Order status updated: Reference={}, {} → {}, ChangedBy={}", 
                order.getReferenceNumber(), previousStatus, newStatus, changedBy.getUsername());

        // BR-ALERT-01: Create client alert when status → READY_FOR_PICKUP
        if (newStatus == OrderStatus.READY_FOR_PICKUP) {
            clientAlertService.createForReadyForPickup(order);
        }

        return order;
    }
}
