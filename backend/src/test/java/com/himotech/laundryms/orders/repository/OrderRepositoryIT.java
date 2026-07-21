package com.himotech.laundryms.orders.repository;

import java.util.UUID;

import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.shared.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence Integration Tests for OrderRepository.
 *
 * <p><b>Foreign Key Dependencies (from erd.dbml):</b>
 * An Order requires:
 * <ul>
 *   <li><b>customer_id</b> → customers.id (NOT NULL)</li>
 *   <li><b>created_by_user_id</b> → users.id (NOT NULL)</li>
 *   <li><b>service_rate_id</b> → service_rates.id (NOT NULL)</li>
 * </ul>
 *
 * <p><b>UNIQUE Constraint:</b>
 * <ul>
 *   <li><b>reference_number</b> UNIQUE (for public tracking)</li>
 * </ul>
 *
 * <p><b>Test Strategy:</b>
 * {@link #setUp()} persists the required foreign key dependencies (User, Customer, ServiceRate)
 * before each test to satisfy database constraints.
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("OrderRepository Persistence Integration Tests")
class OrderRepositoryIT extends AbstractIntegrationTest {

        private static final String DUMMY_PASSWORD_HASH = "it-hash-" + java.util.UUID.randomUUID();

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private User testUser;
    private Customer testCustomer;
    private ServiceRate testServiceRate;

    /**
     * Set up foreign key dependencies before each test.
     *
     * <p>Creates and persists:
     * <ul>
     *   <li>User (STAFF role) - for created_by_user_id</li>
     *   <li>Customer - for customer_id</li>
     *   <li>ServiceRate - for service_rate_id</li>
     * </ul>
     */
    @BeforeEach
    void setUp() {
        // Persist User (satisfies created_by_user_id FK)
        testUser = User.builder()
                .username("teststaff_order_it")
                .passwordHash(DUMMY_PASSWORD_HASH)
                .role(UserRole.STAFF)
                .firstName("Test")
                .lastName("Staff")
                .isActive(true)
                .build();
        testUser = entityManager.persist(testUser);

        // Persist Customer (satisfies customer_id FK)
        testCustomer = Customer.builder()
                .firstName("Test")
                .lastName("Customer")
                .contactNumber("09171234567")
                .build();
        testCustomer = entityManager.persist(testCustomer);

        // Persist ServiceRate (satisfies service_rate_id FK)
        testServiceRate = ServiceRate.builder()
                .serviceName("Test Rate")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
        testServiceRate = entityManager.persist(testServiceRate);

        entityManager.flush();
        entityManager.clear();
    }

    /**
     * Test 1: Verify that an Order with valid foreign keys can be persisted.
     */
    @Test
    @DisplayName("save - Should persist order when all FKs are valid")
    void saveShouldpersistorderWhenallfksarevalid() {
        // Given
        Order order = Order.builder()
                .referenceNumber("LDR-20260425-0001")
                .customer(testCustomer)
                .createdBy(testUser)
                .serviceRate(testServiceRate)
                .weightKg(new BigDecimal("10.00"))
                .totalLoads(2)
                // Snapshot pricing fields (copied from ServiceRate at order creation)
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .extraMinutes(0)
                .baseAmount(new BigDecimal("240.00"))
                .extraMinutesAmount(BigDecimal.ZERO)
                .addonsTotalAmount(BigDecimal.ZERO)
                .grandTotal(new BigDecimal("240.00"))
                .currentStatus(OrderStatus.RECEIVED)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        // When
        Order saved = orderRepository.save(order);
        entityManager.flush();
        entityManager.clear();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getReferenceNumber()).isEqualTo("LDR-20260425-0001");
        assertThat(saved.getCustomer().getId()).isEqualTo(testCustomer.getId());
        assertThat(saved.getCreatedBy().getId()).isEqualTo(testUser.getId());
        assertThat(saved.getServiceRate().getId()).isEqualTo(testServiceRate.getId());
        assertThat(saved.getGrandTotal()).isEqualTo(new BigDecimal("240.00"));
        assertThat(saved.getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();

        // Verify snapshot fields
        assertThat(saved.getBasePricePerLoad()).isEqualTo(new BigDecimal("120.00"));
        assertThat(saved.getKgLimitPerLoad()).isEqualTo(new BigDecimal("8.00"));
        assertThat(saved.getPricePerExtraMinute()).isEqualTo(new BigDecimal("1.00"));

        // Verify persistence
        Order retrieved = orderRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getReferenceNumber()).isEqualTo("LDR-20260425-0001");
    }

    /**
     * Test 2: CRITICAL - Verify UNIQUE constraint on reference_number.
     *
     * <p><b>Constraint from V1__init.sql:</b>
     * <pre>
     * reference_number VARCHAR NOT NULL UNIQUE
     * </pre>
     *
     * <p>Attempting to insert two orders with the same reference_number must throw
     * {@link DataIntegrityViolationException}.
     */
    @Test
    @DisplayName("save - Should throw violation when reference_number is duplicated")
    void saveShouldthrowviolationWhenreferencenumberduplicated() {
        // Given - First order with reference number "REF-001"
        Order order1 = Order.builder()
                .referenceNumber("LDR-20260425-0002")
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
        orderRepository.save(order1);
        entityManager.flush();
        entityManager.clear();

        // When/Then - Attempt to save second order with same reference number
        Order order2 = Order.builder()
                .referenceNumber("LDR-20260425-0002")  // DUPLICATE reference number
                .customer(testCustomer)
                .createdBy(testUser)
                .serviceRate(testServiceRate)
                .weightKg(new BigDecimal("8.00"))
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

        assertThatThrownBy(() -> {
            orderRepository.save(order2);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("reference_number");
    }

    /**
     * Test 3: Verify PostgreSQL enum support (order_status, payment_status).
     *
     * <p>This test ensures the {@code ?stringtype=unspecified} JDBC parameter is working.
     * Without it, PostgreSQL would reject enum values with a type mismatch error.
     */
    @Test
    @DisplayName("save - Should persist order with enum values (validates stringtype=unspecified fix)")
    void saveShouldpersistorderWithenumvalues() {
        // Given - Order with various enum statuses
        Order order = Order.builder()
                .referenceNumber("LDR-20260425-0003")
                .customer(testCustomer)
                .createdBy(testUser)
                .serviceRate(testServiceRate)
                .weightKg(new BigDecimal("15.00"))
                .totalLoads(2)
                // Snapshot pricing fields
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .extraMinutes(10)
                .baseAmount(new BigDecimal("240.00"))
                .extraMinutesAmount(new BigDecimal("10.00"))
                .addonsTotalAmount(BigDecimal.ZERO)
                .grandTotal(new BigDecimal("250.00"))
                .currentStatus(OrderStatus.WASHING)  // PostgreSQL enum
                .paymentStatus(PaymentStatus.UNPAID)  // PostgreSQL enum
                .build();

        // When
        Order saved = orderRepository.save(order);
        entityManager.flush();
        entityManager.clear();

        // Then - Enums should be persisted and retrieved correctly
        Order retrieved = orderRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getCurrentStatus()).isEqualTo(OrderStatus.WASHING);
        assertThat(retrieved.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
    }
}

