package com.himotech.laundryms.notification.repository;

import com.himotech.laundryms.common.enums.NotificationStatus;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.notification.entity.Notification;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.testcontainers.AbstractIntegrationTest;
import com.himotech.laundryms.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence Integration Tests for NotificationRepository.
 *
 * <p><b>Database Constraints Being Tested:</b>
 * <ul>
 *   <li>Foreign key constraint: order_id → orders.id (NOT NULL, CASCADE DELETE)</li>
 *   <li>Foreign key constraint: customer_id → customers.id (NOT NULL, CASCADE DELETE)</li>
 * </ul>
 *
 * <p><b>Database Schema (from V1__init.sql):</b>
 *
 * <pre>
 * CREATE TABLE IF NOT EXISTS notifications (
 *     id          BIGSERIAL PRIMARY KEY,
 *     order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 *     customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
 *     message     TEXT NOT NULL,
 *     created_at  TIMESTAMP NOT NULL DEFAULT now(),
 *     sent_at     TIMESTAMP,
 *     status      notification_status NOT NULL DEFAULT 'PENDING'
 * );
 * </pre>
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("NotificationRepository Persistence Integration Tests")
class NotificationRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private NotificationRepository notificationRepository;

    private Order testOrder;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        // Persist User
        User testUser = User.builder()
                .username("teststaff_notification_it")
                .passwordHash("$2a$10$hashedpassword")
                .role(UserRole.STAFF)
                .firstName("Test")
                .lastName("Staff")
                .isActive(true)
                .build();
        testUser = entityManager.persist(testUser);

        // Persist Customer
        testCustomer = Customer.builder()
                .firstName("Notification")
                .lastName("TestCustomer")
                .contactNumber("09181112222")
                .build();
        testCustomer = entityManager.persist(testCustomer);

        // Persist ServiceRate
        ServiceRate testServiceRate = ServiceRate.builder()
                .serviceName("Notification Test Rate")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
        testServiceRate = entityManager.persist(testServiceRate);

        // Persist Order
        testOrder = Order.builder()
                .referenceNumber("REF-NOTIF-001")
                .customer(testCustomer)
                .createdBy(testUser)
                .serviceRate(testServiceRate)
                .weightKg(new BigDecimal("5.00"))
                .totalLoads(1)
                // Snapshot pricing fields
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .extraMinutes(0)
                .baseAmount(new BigDecimal("120.00"))
                .extraMinutesAmount(BigDecimal.ZERO)
                .addonsTotalAmount(BigDecimal.ZERO)
                .grandTotal(new BigDecimal("120.00"))
                .currentStatus(OrderStatus.RECEIVED)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
        testOrder = entityManager.persist(testOrder);

        entityManager.flush();
        entityManager.clear();
    }

    /**
     * Test 1: Basic persistence test - verify a valid notification can be saved and retrieved.
     */
    @Test
    @DisplayName("save - Should persist notification when valid")
    void save_ShouldPersistNotification_WhenValid() {
        // Given
        Notification notification = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Your order is ready for pickup")
                .status(NotificationStatus.PENDING)
                .build();

        // When
        Notification saved = notificationRepository.save(notification);
        entityManager.flush();
        entityManager.clear();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getOrder().getId()).isEqualTo(testOrder.getId());
        assertThat(saved.getCustomer().getId()).isEqualTo(testCustomer.getId());
        assertThat(saved.getMessage()).isEqualTo("Your order is ready for pickup");
        assertThat(saved.getStatus()).isEqualTo(NotificationStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getSentAt()).isNull();

        // Verify persistence
        Notification retrieved = notificationRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getMessage()).isEqualTo("Your order is ready for pickup");
    }

    /**
     * Test 2: Verify that multiple notifications can be created for the same order.
     * Unlike payments, there's no uniqueness constraint on order_id for notifications.
     */
    @Test
    @DisplayName("Should allow multiple notifications for same order")
    void shouldAllowMultipleNotificationsForSameOrder() {
        // Given - First notification
        Notification notification1 = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Order received")
                .status(NotificationStatus.PENDING)
                .build();
        notificationRepository.save(notification1);
        entityManager.flush();

        // When - Second notification for same order
        Notification notification2 = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Order is being washed")
                .status(NotificationStatus.PENDING)
                .build();
        Notification saved = notificationRepository.save(notification2);
        entityManager.flush();

        // Then - Should succeed
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isNotEqualTo(notification1.getId());
    }

    /**
     * Test 3: Verify foreign key constraint for order_id.
     * Attempting to create a notification with a non-existent order should fail.
     */
    @Test
    @DisplayName("save - Should throw violation when order does not exist")
    void save_ShouldThrowViolation_WhenOrderDoesNotExist() {
        // Given - Notification with non-existent order
        Order detachedOrder = Order.builder()
                .id(99999L) // Non-existent order ID
                .build();

        Notification notification = Notification.builder()
                .order(detachedOrder)
                .customer(testCustomer)
                .message("Test message")
                .status(NotificationStatus.PENDING)
                .build();

        // When/Then - Should fail due to FK constraint
        assertThatThrownBy(() -> {
            notificationRepository.save(notification);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("violates foreign key constraint");
    }

    /**
     * Test 4: Verify foreign key constraint for customer_id.
     * Attempting to create a notification with a non-existent customer should fail.
     */
    @Test
    @DisplayName("save - Should throw violation when customer does not exist")
    void save_ShouldThrowViolation_WhenCustomerDoesNotExist() {
        // Given - Notification with non-existent customer
        Customer detachedCustomer = Customer.builder()
                .id(99999L) // Non-existent customer ID
                .build();

        Notification notification = Notification.builder()
                .order(testOrder)
                .customer(detachedCustomer)
                .message("Test message")
                .status(NotificationStatus.PENDING)
                .build();

        // When/Then - Should fail due to FK constraint
        assertThatThrownBy(() -> {
            notificationRepository.save(notification);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("violates foreign key constraint");
    }

    /**
     * Test 5: Verify notification status updates.
     */
    @Test
    @DisplayName("Should support status transitions")
    void shouldSupportStatusTransitions() {
        // Given - PENDING notification
        Notification notification = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Your order is ready for pickup")
                .status(NotificationStatus.PENDING)
                .build();
        Notification saved = notificationRepository.save(notification);
        entityManager.flush();
        entityManager.clear();

        // When - Update to SENT
        Notification retrieved = notificationRepository.findById(saved.getId()).orElseThrow();
        retrieved.setStatus(NotificationStatus.SENT);
        retrieved.setSentAt(LocalDateTime.now());
        notificationRepository.save(retrieved);
        entityManager.flush();
        entityManager.clear();

        // Then
        Notification updated = notificationRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(NotificationStatus.SENT);
        assertThat(updated.getSentAt()).isNotNull();
    }

    /**
     * Test 6: Verify that notification can be marked as FAILED.
     */
    @Test
    @DisplayName("Should support FAILED status")
    void shouldSupportFailedStatus() {
        // Given
        Notification notification = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Your order is ready for pickup")
                .status(NotificationStatus.PENDING)
                .build();
        Notification saved = notificationRepository.save(notification);
        entityManager.flush();
        entityManager.clear();

        // When - Mark as FAILED
        Notification retrieved = notificationRepository.findById(saved.getId()).orElseThrow();
        retrieved.setStatus(NotificationStatus.FAILED);
        notificationRepository.save(retrieved);
        entityManager.flush();

        // Then
        Notification updated = notificationRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(NotificationStatus.FAILED);
    }

    /**
     * Test 7: Verify that deleting an order cascades to its notifications.
     * This tests the ON DELETE CASCADE constraint.
     */
    @Test
    @DisplayName("Should cascade delete notifications when order is deleted")
    void shouldCascadeDeleteNotificationsWhenOrderDeleted() {
        // Given - Create notification for order
        Notification notification = Notification.builder()
                .order(testOrder)
                .customer(testCustomer)
                .message("Order update")
                .status(NotificationStatus.PENDING)
                .build();
        Notification saved = notificationRepository.save(notification);
        entityManager.flush();
        Long notificationId = saved.getId();

        // When - Delete the order
        Order orderToDelete = entityManager.find(Order.class, testOrder.getId());
        entityManager.remove(orderToDelete);
        entityManager.flush();
        entityManager.clear();

        // Then - Notification should be deleted due to CASCADE
        assertThat(notificationRepository.findById(notificationId)).isEmpty();
    }
}
