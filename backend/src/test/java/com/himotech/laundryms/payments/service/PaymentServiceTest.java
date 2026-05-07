package com.himotech.laundryms.payments.service;

import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.exception.ConflictException;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.repository.PaymentRepository;
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

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PaymentService.
 * Covers: US-06, BR-PAY-02, BR-PAY-03, BR-PAY-04.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    private static final Long ORDER_ID = 1L;
    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final BigDecimal GRAND_TOTAL = new BigDecimal("240.00");

    private Order order;
    private User user;

    @BeforeEach
    void setUp() {
        order = TestDataBuilders.order().id(ORDER_ID).grandTotal(GRAND_TOTAL).build();
        user = TestDataBuilders.user().build();

        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(paymentRepository.existsByOrder_Id(ORDER_ID)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            if (p.getId() == null) {
                p.setId(1L);
            }
            return p;
        });
    }

    @Nested
    @DisplayName("create - Happy Path (US-06, BR-PAY-03, BR-PAY-04)")
    class CreateHappyPath {

        @Test
        @DisplayName("Should succeed when amount matches grand total (BR-PAY-03)")
        void create_ShouldSucceed_WhenAmountMatchesGrandTotal() {
            // Given
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, GRAND_TOTAL, USER_ID);

            // When
            Payment result = paymentService.create(command);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAmountPaid()).isEqualByComparingTo(GRAND_TOTAL);
            assertThat(result.getOrder()).isEqualTo(order);
            assertThat(result.getReceivedBy()).isEqualTo(user);
            assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);  // BR-PAY-04
            verify(orderRepository).save(order);
            verify(paymentRepository).save(any(Payment.class));
        }

        @Test
        @DisplayName("Should update order payment_status to PAID (BR-PAY-04)")
        void create_ShouldUpdateOrderPaymentStatus_ToPaid() {
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, GRAND_TOTAL, USER_ID);

            paymentService.create(command);

            assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        }

        @Test
        @DisplayName("Should save payment with correct method and remarks")
        void create_ShouldSavePayment_WithMethodAndRemarks() {
            var command = TestDataBuilders.recordPaymentCommand(
                    ORDER_ID, GRAND_TOTAL, PaymentMethod.GCASH, USER_ID, "Paid via GCash", "GCASH-REF-123"
            );

            Payment result = paymentService.create(command);

            ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(captor.capture());
            Payment saved = captor.getValue();
            assertThat(saved.getPaymentMethod()).isEqualTo(PaymentMethod.GCASH);
            assertThat(saved.getRemarks()).isEqualTo("Paid via GCash");
        }
    }

    @Nested
    @DisplayName("create - One Payment Per Order (BR-PAY-02)")
    class CreateOnePaymentPerOrder {

        @Test
        @DisplayName("Should throw ConflictException when payment already exists (BR-PAY-02)")
        void create_ShouldThrowConflict_WhenPaymentAlreadyExists() {
            // Given - payment already recorded for this order
            when(paymentRepository.existsByOrder_Id(ORDER_ID)).thenReturn(true);
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, GRAND_TOTAL, USER_ID);

            // When/Then
            assertThatThrownBy(() -> paymentService.create(command))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Payment already recorded for this order");
            verify(paymentRepository, never()).save(any());
            verify(orderRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("create - Amount Validation (BR-PAY-03)")
    class CreateAmountValidation {

        @Test
        @DisplayName("Should throw when amount is less than grand total")
        void create_ShouldThrow_WhenAmountLessThanGrandTotal() {
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, new BigDecimal("200.00"), USER_ID);

            assertThatThrownBy(() -> paymentService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Payment amount must match order total")
                    .hasMessageContaining("Expected")
                    .hasMessageContaining("240")
                    .hasMessageContaining("200");
            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw when amount is greater than grand total")
        void create_ShouldThrow_WhenAmountGreaterThanGrandTotal() {
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, new BigDecimal("250.00"), USER_ID);

            assertThatThrownBy(() -> paymentService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Payment amount must match order total");
        }
    }

    @Nested
    @DisplayName("create - Not Found")
    class CreateNotFound {

        @Test
        @DisplayName("Should throw when order not found (US-06)")
        void create_ShouldThrow_WhenOrderNotFound() {
            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, GRAND_TOTAL, USER_ID);

            assertThatThrownBy(() -> paymentService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found");
        }

        @Test
        @DisplayName("Should throw when user not found")
        void create_ShouldThrow_WhenUserNotFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.recordPaymentCommand(ORDER_ID, GRAND_TOTAL, USER_ID);

            assertThatThrownBy(() -> paymentService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }
    }
}
