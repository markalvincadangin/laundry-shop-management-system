package com.himotech.laundryms.clientalert.repository;

import java.util.UUID;

import com.himotech.laundryms.clientalert.ClientAlertStatus;
import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.shared.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.clientalert.entity.ClientAlert;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.support.AbstractIntegrationTest;
import com.himotech.laundryms.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence Integration Tests for clientAlertRepository.
 *
 * <p>
 * <b>Database Constraints Being Tested:</b>
 * <ul>
 * <li>Foreign key constraint: order_id → orders.id (NOT NULL, CASCADE
 * DELETE)</li>
 * </ul>
 *
 * <p>
 * <b>Database Schema (from V1__init.sql):</b>
 *
 * <pre>
 * CREATE TABLE IF NOT EXISTS ClientAlerts (
 *     id          BIGSERIAL PRIMARY KEY,
 *     order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 *     channel     VARCHAR(30) NOT NULL DEFAULT 'IN_APP',
 *     message     TEXT NOT NULL,
 *     created_at  TIMESTAMP NOT NULL DEFAULT now(),
 *     sent_at     TIMESTAMP,
 *     status      VARCHAR(30) NOT NULL DEFAULT 'PENDING'
 * );
 * </pre>
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("ClientAlertRepository Persistence Integration Tests")
class ClientAlertRepositoryIT extends AbstractIntegrationTest {

        private static final String DUMMY_PASSWORD_HASH = "it-hash-" + java.util.UUID.randomUUID();

        @Autowired
        private TestEntityManager entityManager;

        @Autowired
        private ClientAlertRepository clientAlertRepository;

        private Order testOrder;
        private Customer testCustomer;

        @BeforeEach
        void setUp() {
                // Persist User
                User testUser = User.builder()
                                .username("teststaff_ClientAlert_it")
                                .passwordHash(DUMMY_PASSWORD_HASH)
                                .role(UserRole.STAFF)
                                .firstName("Test")
                                .lastName("Staff")
                                .isActive(true)
                                .build();
                testUser = entityManager.persist(testUser);

                // Persist Customer
                testCustomer = Customer.builder()
                                .firstName("ClientAlert")
                                .lastName("TestCustomer")
                                .contactNumber("09181112222")
                                .build();
                testCustomer = entityManager.persist(testCustomer);

                // Persist ServiceRate
                ServiceRate testServiceRate = ServiceRate.builder()
                                .serviceName("ClientAlert Test Rate")
                                .basePricePerLoad(new BigDecimal("120.00"))
                                .kgLimitPerLoad(new BigDecimal("8.00"))
                                .pricePerExtraMinute(new BigDecimal("1.00"))
                                .isActive(true)
                                .build();
                testServiceRate = entityManager.persist(testServiceRate);

                // Persist Order
                testOrder = Order.builder()
                                .referenceNumber("LDR-20260425-9999")
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
         * Test 1: Basic persistence test - verify a valid ClientAlert can be saved and
         * retrieved.
         */
        @Test
        @DisplayName("save - Should persist ClientAlert when valid")
        void saveShouldpersistclientalertWhenvalid() {
                // Given
                ClientAlert clientAlert = ClientAlert.builder()
                                .order(testOrder)

                                .message("Your order is ready for pickup")
                                .status(ClientAlertStatus.PENDING)
                                .build();

                // When
                ClientAlert saved = clientAlertRepository.save(clientAlert);
                entityManager.flush();
                entityManager.clear();

                // Then
                assertThat(saved.getId()).isNotNull();
                assertThat(saved.getOrder().getId()).isEqualTo(testOrder.getId());
                assertThat(saved.getOrder().getCustomer().getId()).isEqualTo(testCustomer.getId());
                assertThat(saved.getMessage()).isEqualTo("Your order is ready for pickup");
                assertThat(saved.getStatus()).isEqualTo(ClientAlertStatus.PENDING);
                assertThat(saved.getCreatedAt()).isNotNull();
                assertThat(saved.getSentAt()).isNull();

                // Verify persistence
                ClientAlert retrieved = clientAlertRepository.findById(saved.getId()).orElseThrow();
                assertThat(retrieved.getMessage()).isEqualTo("Your order is ready for pickup");
        }

        /**
         * Test 2: Verify that multiple ClientAlerts can be created for the same order.
         * Unlike payments, there's no uniqueness constraint on order_id for
         * ClientAlerts.
         */
        @Test
        @DisplayName("Should allow multiple ClientAlerts for same order")
        void shouldAllowMultipleClientAlertsForSameOrder() {
                // Given - First ClientAlert
                ClientAlert clientAlert1 = ClientAlert.builder()
                                .order(testOrder)
                                .message("Order received")
                                .status(ClientAlertStatus.PENDING)
                                .build();
                clientAlertRepository.save(clientAlert1);
                entityManager.flush();

                // When - Second ClientAlert for same order
                ClientAlert clientAlert2 = ClientAlert.builder()
                                .order(testOrder)
                                .message("Order is being washed")
                                .status(ClientAlertStatus.PENDING)
                                .build();
                ClientAlert saved = clientAlertRepository.save(clientAlert2);
                entityManager.flush();

                // Then - Should succeed
                assertThat(saved.getId()).isNotNull();
                assertThat(saved.getId()).isNotEqualTo(clientAlert1.getId());
        }

        /**
         * Test 3: Verify foreign key constraint for order_id.
         * Attempting to create a ClientAlert with a non-existent order should fail.
         */
        @Test
        @DisplayName("save - Should throw violation when order does not exist")
        void saveShouldthrowviolationWhenorderdoesnotexist() {
                // Given - ClientAlert with non-existent order
                Order detachedOrder = Order.builder()
                                .id(java.util.UUID.randomUUID()) // Non-existent order ID
                                .build();

                ClientAlert clientAlert = ClientAlert.builder()
                                .order(detachedOrder)
                                .message("Test message")
                                .status(ClientAlertStatus.PENDING)
                                .build();

                // When/Then - Should fail due to FK constraint
                assertThatThrownBy(() -> {
                        clientAlertRepository.save(clientAlert);
                        entityManager.flush();
                })
                                .isInstanceOf(DataIntegrityViolationException.class)
                                .hasMessageContaining("violates foreign key constraint");
        }

        /**
         * Test 4: Verify status updates.
         */
        @Test
        @DisplayName("Should support status transitions")
        void shouldSupportStatusTransitions() {
                // Given - PENDING ClientAlert
                ClientAlert clientAlert = ClientAlert.builder()
                                .order(testOrder)
                                .message("Your order is ready for pickup")
                                .status(ClientAlertStatus.PENDING)
                                .build();
                ClientAlert saved = clientAlertRepository.save(clientAlert);
                entityManager.flush();
                entityManager.clear();

                // When - Update to SENT
                ClientAlert retrieved = clientAlertRepository.findById(saved.getId()).orElseThrow();
                retrieved.setStatus(ClientAlertStatus.SENT);
                retrieved.setSentAt(Instant.now());
                clientAlertRepository.save(retrieved);
                entityManager.flush();
                entityManager.clear();

                // Then
                ClientAlert updated = clientAlertRepository.findById(saved.getId()).orElseThrow();
                assertThat(updated.getStatus()).isEqualTo(ClientAlertStatus.SENT);
                assertThat(updated.getSentAt()).isNotNull();
        }

        /**
         * Test 6: Verify that ClientAlert can be marked as FAILED.
         */
        @Test
        @DisplayName("Should support FAILED status")
        void shouldSupportFailedStatus() {
                // Given
                ClientAlert clientAlert = ClientAlert.builder()
                                .order(testOrder)

                                .message("Your order is ready for pickup")
                                .status(ClientAlertStatus.PENDING)
                                .build();
                ClientAlert saved = clientAlertRepository.save(clientAlert);
                entityManager.flush();
                entityManager.clear();

                // When - Mark as FAILED
                ClientAlert retrieved = clientAlertRepository.findById(saved.getId()).orElseThrow();
                retrieved.setStatus(ClientAlertStatus.FAILED);
                clientAlertRepository.save(retrieved);
                entityManager.flush();

                // Then
                ClientAlert updated = clientAlertRepository.findById(saved.getId()).orElseThrow();
                assertThat(updated.getStatus()).isEqualTo(ClientAlertStatus.FAILED);
        }

        /**
         * Test 7: Verify that deleting an order cascades to its ClientAlerts.
         * This tests the ON DELETE CASCADE constraint.
         */
        @Test
        @DisplayName("Should cascade delete ClientAlerts when order is deleted")
        void shouldCascadeDeleteClientAlertsWhenOrderDeleted() {
                // Given - Create ClientAlert for order
                ClientAlert clientAlert = ClientAlert.builder()
                                .order(testOrder)
                                .message("Order update")
                                .status(ClientAlertStatus.PENDING)
                                .build();
                ClientAlert saved = clientAlertRepository.save(clientAlert);
                entityManager.flush();
                UUID ClientAlertId = saved.getId();

                // When - Delete the order
                Order orderToDelete = entityManager.find(Order.class, testOrder.getId());
                entityManager.remove(orderToDelete);
                entityManager.flush();
                entityManager.clear();

                // Then - ClientAlert should be deleted due to CASCADE
                assertThat(clientAlertRepository.findById(ClientAlertId)).isEmpty();
        }
}
