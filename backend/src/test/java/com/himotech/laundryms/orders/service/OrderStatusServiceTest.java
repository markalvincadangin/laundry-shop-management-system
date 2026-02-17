package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.notification.NotificationService;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.entity.OrderStatusLog;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderStatusLogRepository;
import com.himotech.laundryms.support.TestDataBuilders;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for OrderStatusService.
 * Covers: US-03, BR-OL-03, BR-OL-04, BR-OL-05.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("OrderStatusService Unit Tests")
class OrderStatusServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderStatusLogRepository orderStatusLogRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderStatusService orderStatusService;

    private static final Long ORDER_ID = 1L;
    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private Order order;
    private User user;

    @BeforeEach
    void setUp() {
        order = TestDataBuilders.order().id(ORDER_ID).currentStatus(OrderStatus.RECEIVED).build();
        user = TestDataBuilders.user().build();

        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderStatusLogRepository.save(any(OrderStatusLog.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Nested
    @DisplayName("updateStatus - Happy Path (US-03)")
    class UpdateStatusHappyPath {

        @Test
        @DisplayName("Should succeed when valid transition RECEIVED -> WASHING")
        void updateStatus_ShouldSucceed_WhenValidTransition() {
            // Given
            assertThat(order.getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);

            // When
            Order result = orderStatusService.updateStatus(ORDER_ID, OrderStatus.WASHING, USER_ID, null);

            // Then
            assertThat(result.getCurrentStatus()).isEqualTo(OrderStatus.WASHING);
            verify(orderRepository).save(order);

            ArgumentCaptor<OrderStatusLog> logCaptor = ArgumentCaptor.forClass(OrderStatusLog.class);
            verify(orderStatusLogRepository).save(logCaptor.capture());
            OrderStatusLog log = logCaptor.getValue();
            assertThat(log.getPreviousStatus()).isEqualTo(OrderStatus.RECEIVED);
            assertThat(log.getNewStatus()).isEqualTo(OrderStatus.WASHING);
        }

        @Test
        @DisplayName("Should succeed when transitioning READY_FOR_PICKUP -> RELEASED (BR-OL-05) and payment is PAID")
        void updateStatus_ShouldSucceed_WhenReleasingFromReadyForPickupAndPaid() {
            // Given - order is READY_FOR_PICKUP and PAID (BR-PAY-01: payment upon pickup)
            order.setCurrentStatus(OrderStatus.READY_FOR_PICKUP);
            order.setPaymentStatus(PaymentStatus.PAID);

            // When
            Order result = orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, "Verified");

            // Then
            assertThat(result.getCurrentStatus()).isEqualTo(OrderStatus.RELEASED);
            verify(orderStatusLogRepository).save(any(OrderStatusLog.class));
        }

        @Test
        @DisplayName("Should save notes in status log")
        void updateStatus_ShouldSaveNotes_InStatusLog() {
            // When
            orderStatusService.updateStatus(ORDER_ID, OrderStatus.WASHING, USER_ID, "Started washing");

            // Then
            ArgumentCaptor<OrderStatusLog> logCaptor = ArgumentCaptor.forClass(OrderStatusLog.class);
            verify(orderStatusLogRepository).save(logCaptor.capture());
            assertThat(logCaptor.getValue().getNotes()).isEqualTo("Started washing");
        }

        @Test
        @DisplayName("Should create notification when status -> READY_FOR_PICKUP (BR-NOTIF-01)")
        void updateStatus_ShouldCreateNotification_WhenReadyForPickup() {
            // Given - order is FOLDING
            order.setCurrentStatus(OrderStatus.FOLDING);

            // When
            orderStatusService.updateStatus(ORDER_ID, OrderStatus.READY_FOR_PICKUP, USER_ID, null);

            // Then
            verify(notificationService).createForReadyForPickup(eq(order));
        }
    }

    @Nested
    @DisplayName("updateStatus - Release Precondition (BR-OL-05)")
    class UpdateStatusReleasePrecondition {

        @Test
        @DisplayName("Should reject RELEASED when current status is RECEIVED (BR-OL-04)")
        void updateStatus_ShouldRejectRelease_WhenCurrentIsReceived() {
            // Given - order is RECEIVED
            assertThat(order.getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);

            // When/Then - BR-OL-04: RECEIVED can only transition to WASHING or CANCELLED
            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Invalid status transition");
        }

        @Test
        @DisplayName("Should reject RELEASED when current status is WASHING (BR-OL-04)")
        void updateStatus_ShouldRejectRelease_WhenCurrentIsWashing() {
            order.setCurrentStatus(OrderStatus.WASHING);

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Invalid status transition");
        }

        @Test
        @DisplayName("Should reject RELEASED when current status is DRYING (BR-OL-04)")
        void updateStatus_ShouldRejectRelease_WhenCurrentIsDrying() {
            order.setCurrentStatus(OrderStatus.DRYING);

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Invalid status transition");
        }

        @Test
        @DisplayName("Should reject RELEASED when current status is FOLDING (BR-OL-04)")
        void updateStatus_ShouldRejectRelease_WhenCurrentIsFolding() {
            order.setCurrentStatus(OrderStatus.FOLDING);

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Invalid status transition");
        }

        @Test
        @DisplayName("Should reject RELEASED when payment is UNPAID (BR-PAY-01: payment upon pickup)")
        void updateStatus_ShouldRejectRelease_WhenPaymentUnpaid() {
            // Given - order is READY_FOR_PICKUP but UNPAID
            order.setCurrentStatus(OrderStatus.READY_FOR_PICKUP);
            order.setPaymentStatus(PaymentStatus.UNPAID);

            // When/Then
            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RELEASED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Order must be paid before release")
                    .hasMessageContaining("Record payment first");
        }
    }

    @Nested
    @DisplayName("updateStatus - Validation (BR-OL-03, BR-OL-04)")
    class UpdateStatusValidation {

        @Test
        @DisplayName("Should reject when new status is null (BR-OL-03)")
        void updateStatus_ShouldReject_WhenStatusNull() {
            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, null, USER_ID, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid order status");
        }

        @Test
        @DisplayName("Should reject when new status equals current status")
        void updateStatus_ShouldReject_WhenSameStatus() {
            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RECEIVED, USER_ID, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("New status cannot be the same as the current status");
        }

        @Test
        @DisplayName("Should reject invalid transition e.g. WASHING -> RECEIVED (BR-OL-04)")
        void updateStatus_ShouldReject_WhenInvalidTransition() {
            order.setCurrentStatus(OrderStatus.WASHING);

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.RECEIVED, USER_ID, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Invalid status transition");
        }
    }

    @Nested
    @DisplayName("updateStatus - Not Found")
    class UpdateStatusNotFound {

        @Test
        @DisplayName("Should throw when order not found (US-03)")
        void updateStatus_ShouldThrow_WhenOrderNotFound() {
            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.WASHING, USER_ID, null))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found");
        }

        @Test
        @DisplayName("Should throw when user not found")
        void updateStatus_ShouldThrow_WhenUserNotFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderStatusService.updateStatus(ORDER_ID, OrderStatus.WASHING, USER_ID, null))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }
    }
}
