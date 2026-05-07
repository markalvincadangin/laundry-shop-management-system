package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.support.AbstractIntegrationTest;
import com.himotech.laundryms.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence Integration Tests for PaymentRepository.
 *
 * <p><b>Business Rule Being Tested: BR-PAY-02</b>
 * <blockquote>
 * "One Payment Per Order"
 * </blockquote>
 *
 * <p><b>Database Constraint (from V1__init.sql):</b>
 * <pre>
 * order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id)
 * </pre>
 *
 * <p>The UNIQUE constraint on {@code order_id} ensures that each order can have
 * at most ONE payment record. Attempting to insert a second payment for the same
 * order must result in {@link DataIntegrityViolationException}.
 *
 * <p><b>Foreign Key Dependencies:</b>
 * A Payment requires:
 * <ul>
 *   <li><b>order_id</b> → orders.id (NOT NULL, UNIQUE)</li>
 *   <li><b>received_by_user_id</b> → users.id (NOT NULL)</li>
 * </ul>
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("PaymentRepository Persistence Integration Tests")
class PaymentRepositoryIT extends AbstractIntegrationTest {

        private static final String DUMMY_PASSWORD_HASH = "it-hash-" + java.util.UUID.randomUUID();

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PaymentRepository paymentRepository;

    private Order testOrder;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Persist User
        testUser = User.builder()
                .username("testcashier_payment_it")
                .passwordHash(DUMMY_PASSWORD_HASH)
                .role(UserRole.STAFF)
                .firstName("Test")
                .lastName("Cashier")
                .isActive(true)
                .build();
        testUser = entityManager.persist(testUser);

        // Persist Customer
        Customer testCustomer = Customer.builder()
                .firstName("Payment")
                .lastName("TestCustomer")
                .contactNumber("09181234567")
                .build();
        testCustomer = entityManager.persist(testCustomer);

        // Persist ServiceRate
        ServiceRate testServiceRate = ServiceRate.builder()
                .serviceName("Payment Test Rate")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
        testServiceRate = entityManager.persist(testServiceRate);

        // Persist Order
        testOrder = Order.builder()
                .referenceNumber("REF-PAY-001")
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
        testOrder = entityManager.persist(testOrder);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("save_ShouldPersistPayment_WhenOrderIsNotPaid")
    void save_ShouldPersistPayment_WhenOrderIsNotPaid() {
        // Given
        Payment payment = Payment.builder()
                .order(testOrder)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.CASH)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .remarks("Full payment via cash")
                .build();

        // When
        Payment saved = paymentRepository.save(payment);
        entityManager.flush();
        entityManager.clear();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getOrder().getId()).isEqualTo(testOrder.getId());
        assertThat(saved.getAmountPaid()).isEqualTo(new BigDecimal("240.00"));
        assertThat(saved.getPaymentMethod()).isEqualTo(PaymentMethod.CASH);
        assertThat(saved.getReceivedBy().getId()).isEqualTo(testUser.getId());
        assertThat(saved.getPaymentDate()).isNotNull();
        assertThat(saved.getRemarks()).isEqualTo("Full payment via cash");

        // Verify persistence
        Payment retrieved = paymentRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getAmountPaid()).isEqualTo(new BigDecimal("240.00"));
    }

    @Test
    @DisplayName("save_ShouldThrowViolation_WhenOrderAlreadyHasPayment (BR-PAY-02)")
    void save_ShouldThrowViolation_WhenOrderAlreadyHasPayment() {
        // Given - First payment for Order #1
        Payment payment1 = Payment.builder()
                .order(testOrder)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.CASH)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .build();
        paymentRepository.save(payment1);
        entityManager.flush();
        entityManager.clear();

        // When/Then - Attempt to save a second payment for the same Order #1
        Payment payment2 = Payment.builder()
                .order(testOrder)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.GCASH)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .build();

        assertThatThrownBy(() -> {
            paymentRepository.save(payment2);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("order_id");
    }

    @Test
    @DisplayName("existsByOrderId_ShouldReturnTrue_WhenPaymentExists")
    void existsByOrderId_ShouldReturnTrue_WhenPaymentExists() {
        // Given - Payment exists for the order
        Payment payment = Payment.builder()
                .order(testOrder)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.GCASH)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .build();
        paymentRepository.save(payment);
        entityManager.flush();
        entityManager.clear();

        // When
        boolean exists = paymentRepository.existsByOrder_Id(testOrder.getId());

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsByOrderId_ShouldReturnFalse_WhenNoPaymentExists")
    void existsByOrderId_ShouldReturnFalse_WhenNoPaymentExists() {
        // Given - No payment for the order (setUp created unpaid order)

        // When
        boolean exists = paymentRepository.existsByOrder_Id(testOrder.getId());

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should support different payment methods")
    void shouldSupportDifferentPaymentMethods() {
        // Given - Create another order for testing different payment method
        Customer anotherCustomer = Customer.builder()
                .firstName("Another")
                .lastName("Customer")
                .contactNumber("09191234567")
                .build();
        anotherCustomer = entityManager.persist(anotherCustomer);

        ServiceRate rate = entityManager.find(ServiceRate.class,
                entityManager.find(ServiceRate.class, testOrder.getServiceRate().getId()).getId());

        Order anotherOrder = Order.builder()
                .referenceNumber("REF-PAY-002")
                .customer(anotherCustomer)
                .createdBy(testUser)
                .serviceRate(rate)
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
        anotherOrder = entityManager.persist(anotherOrder);
        entityManager.flush();

        // When - Save payment with BANK_TRANSFER
        Payment payment = Payment.builder()
                .order(anotherOrder)
                .amountPaid(new BigDecimal("120.00"))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .remarks("Bank transfer via BPI")
                .build();
        Payment saved = paymentRepository.save(payment);
        entityManager.flush();

        // Then
        assertThat(saved.getPaymentMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
        assertThat(saved.getRemarks()).contains("BPI");
    }

    @Test
    @DisplayName("Should enforce foreign key constraint for order")
    void shouldEnforceForeignKeyConstraintForOrder() {
        // Given - Payment with non-existent order
        Order detachedOrder = Order.builder()
                .id(99999L) // Non-existent order ID
                .referenceNumber("FAKE-ORDER")
                .build();

        Payment payment = Payment.builder()
                .order(detachedOrder)
                .amountPaid(new BigDecimal("100.00"))
                .paymentMethod(PaymentMethod.CASH)
                .receivedBy(testUser)
                .paymentDate(Instant.now())
                .build();

        // When/Then - Should fail due to FK constraint
        assertThatThrownBy(() -> {
            paymentRepository.save(payment);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("violates foreign key constraint");
    }

    @Nested
    @DisplayName("findAllFiltered - Date Range and Pagination Tests")
    class FindAllFilteredTests {

        private Order order1, order2, order3;
        private Payment payment1, payment2, payment3;
        private Instant baseTime;

        @BeforeEach
        void setUpPayments() {
            baseTime = Instant.parse("2026-02-15T10:00:00Z");

            // Create additional customers and orders
            Customer customer1 = Customer.builder()
                    .firstName("Alice")
                    .lastName("Smith")
                    .contactNumber("09171111111")
                    .build();
            customer1 = entityManager.persist(customer1);

            Customer customer2 = Customer.builder()
                    .firstName("Bob")
                    .lastName("Jones")
                    .contactNumber("09172222222")
                    .build();
            customer2 = entityManager.persist(customer2);

            ServiceRate rate = entityManager.find(ServiceRate.class, testOrder.getServiceRate().getId());

            order1 = Order.builder()
                    .referenceNumber("REF-FILTER-001")
                    .customer(customer1)
                    .createdBy(testUser)
                    .serviceRate(rate)
                    .weightKg(new BigDecimal("5.00"))
                    .totalLoads(1)
                    .basePricePerLoad(new BigDecimal("120.00"))
                    .kgLimitPerLoad(new BigDecimal("8.00"))
                    .pricePerExtraMinute(new BigDecimal("1.00"))
                    .extraMinutes(0)
                    .baseAmount(new BigDecimal("120.00"))
                    .extraMinutesAmount(BigDecimal.ZERO)
                    .addonsTotalAmount(BigDecimal.ZERO)
                    .grandTotal(new BigDecimal("120.00"))
                    .currentStatus(OrderStatus.RECEIVED)
                    .paymentStatus(PaymentStatus.PAID)
                    .build();
            order1 = entityManager.persist(order1);

            order2 = Order.builder()
                    .referenceNumber("REF-FILTER-002")
                    .customer(customer2)
                    .createdBy(testUser)
                    .serviceRate(rate)
                    .weightKg(new BigDecimal("10.00"))
                    .totalLoads(2)
                    .basePricePerLoad(new BigDecimal("120.00"))
                    .kgLimitPerLoad(new BigDecimal("8.00"))
                    .pricePerExtraMinute(new BigDecimal("1.00"))
                    .extraMinutes(0)
                    .baseAmount(new BigDecimal("240.00"))
                    .extraMinutesAmount(BigDecimal.ZERO)
                    .addonsTotalAmount(BigDecimal.ZERO)
                    .grandTotal(new BigDecimal("240.00"))
                    .currentStatus(OrderStatus.RECEIVED)
                    .paymentStatus(PaymentStatus.PAID)
                    .build();
            order2 = entityManager.persist(order2);

            order3 = Order.builder()
                    .referenceNumber("REF-FILTER-003")
                    .customer(customer1)
                    .createdBy(testUser)
                    .serviceRate(rate)
                    .weightKg(new BigDecimal("15.00"))
                    .totalLoads(2)
                    .basePricePerLoad(new BigDecimal("120.00"))
                    .kgLimitPerLoad(new BigDecimal("8.00"))
                    .pricePerExtraMinute(new BigDecimal("1.00"))
                    .extraMinutes(0)
                    .baseAmount(new BigDecimal("240.00"))
                    .extraMinutesAmount(BigDecimal.ZERO)
                    .addonsTotalAmount(BigDecimal.ZERO)
                    .grandTotal(new BigDecimal("240.00"))
                    .currentStatus(OrderStatus.RECEIVED)
                    .paymentStatus(PaymentStatus.PAID)
                    .build();
            order3 = entityManager.persist(order3);

            // Create payments with different dates
            payment1 = Payment.builder()
                    .order(order1)
                    .amountPaid(new BigDecimal("120.00"))
                    .paymentMethod(PaymentMethod.CASH)
                    .receivedBy(testUser)
                    .paymentDate(baseTime.minus(2, ChronoUnit.DAYS)) // Feb 13
                    .remarks("Payment 1")
                    .build();
            payment1 = paymentRepository.save(payment1);

            payment2 = Payment.builder()
                    .order(order2)
                    .amountPaid(new BigDecimal("240.00"))
                    .paymentMethod(PaymentMethod.GCASH)
                    .receivedBy(testUser)
                    .paymentDate(baseTime) // Feb 15
                    .remarks("Payment 2")
                    .build();
            payment2 = paymentRepository.save(payment2);

            payment3 = Payment.builder()
                    .order(order3)
                    .amountPaid(new BigDecimal("240.00"))
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .receivedBy(testUser)
                    .paymentDate(baseTime.plus(2, ChronoUnit.DAYS)) // Feb 17
                    .remarks("Payment 3")
                    .build();
            payment3 = paymentRepository.save(payment3);

            entityManager.flush();
            entityManager.clear();
        }

        @Test
        @DisplayName("Should return all payments when all filters are NULL")
        void findAllFiltered_ShouldReturnAllPayments_WhenAllFiltersNull() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, null, null, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(3);
            assertThat(result.getContent()).hasSize(3);
            // Verify associations are eagerly loaded (no LazyInitializationException)
            result.getContent().forEach(payment -> {
                assertThat(payment.getOrder()).isNotNull();
                assertThat(payment.getOrder().getCustomer()).isNotNull();
                assertThat(payment.getReceivedBy()).isNotNull();
            });
        }

        @Test
        @DisplayName("Should filter by date range (from and to)")
        void findAllFiltered_ShouldFilterByDateRange() {
            // Given - Filter for payments from Feb 14 to Feb 16 (should get payment2 only)
            Instant from = baseTime.minus(1, ChronoUnit.DAYS); // Feb 14
            Instant to = baseTime.plus(1, ChronoUnit.DAYS);    // Feb 16
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, from, to, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getId()).isEqualTo(payment2.getId());
            assertThat(result.getContent().get(0).getRemarks()).isEqualTo("Payment 2");
        }

        @Test
        @DisplayName("Should filter by from date only (NULL to date)")
        void findAllFiltered_ShouldFilterByFromDateOnly() {
            // Given - Filter for payments from Feb 15 onwards (should get payment2 and payment3)
            Instant from = baseTime; // Feb 15
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, from, null, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).extracting(Payment::getId)
                    .containsExactlyInAnyOrder(payment2.getId(), payment3.getId());
        }

        @Test
        @DisplayName("Should filter by to date only (NULL from date)")
        void findAllFiltered_ShouldFilterByToDateOnly() {
            // Given - Filter for payments before Feb 16 (should get payment1 and payment2)
            Instant to = baseTime.plus(1, ChronoUnit.DAYS); // Feb 16
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, null, to, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).extracting(Payment::getId)
                    .containsExactlyInAnyOrder(payment1.getId(), payment2.getId());
        }

        @Test
        @DisplayName("Should filter by orderId")
        void findAllFiltered_ShouldFilterByOrderId() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(order1.getId(), null, null, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getOrder().getId()).isEqualTo(order1.getId());
            assertThat(result.getContent().get(0).getRemarks()).isEqualTo("Payment 1");
        }

        @Test
        @DisplayName("Should filter by orderId and date range")
        void findAllFiltered_ShouldFilterByOrderIdAndDateRange() {
            // Given - Filter for order2 with date range covering payment2
            Instant from = baseTime.minus(1, ChronoUnit.DAYS); // Feb 14
            Instant to = baseTime.plus(1, ChronoUnit.DAYS);    // Feb 16
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(order2.getId(), from, to, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getOrder().getId()).isEqualTo(order2.getId());
        }

        @Test
        @DisplayName("Should return empty page when no payments match filters")
        void findAllFiltered_ShouldReturnEmptyPage_WhenNoMatches() {
            // Given - Date range with no payments
            Instant from = baseTime.plus(10, ChronoUnit.DAYS); // Feb 25
            Instant to = baseTime.plus(20, ChronoUnit.DAYS);   // Mar 7
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, from, to, null), pageable);

            // Then
            assertThat(result.getTotalElements()).isEqualTo(0);
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should paginate correctly with page size")
        void findAllFiltered_ShouldPaginateCorrectly() {
            // Given - Page size of 2
            Pageable firstPage = PageRequest.of(0, 2);
            Pageable secondPage = PageRequest.of(1, 2);

            // When
            Page<Payment> page1 = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, null, null, null), firstPage);
            Page<Payment> page2 = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, null, null, null), secondPage);

            // Then
            assertThat(page1.getTotalElements()).isEqualTo(3);
            assertThat(page1.getContent()).hasSize(2);
            assertThat(page1.getTotalPages()).isEqualTo(2);
            assertThat(page1.isFirst()).isTrue();
            assertThat(page1.hasNext()).isTrue();

            assertThat(page2.getContent()).hasSize(1);
            assertThat(page2.isLast()).isTrue();
            assertThat(page2.hasPrevious()).isTrue();
        }

        @Test
        @DisplayName("Should eagerly fetch associations to avoid N+1 queries")
        void findAllFiltered_ShouldEagerlyFetchAssociations() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);

            // When
            Page<Payment> result = paymentRepository.findAll(com.himotech.laundryms.payments.repository.PaymentSpecification.filterBy(null, null, null, null), pageable);
            entityManager.clear(); // Clear persistence context to ensure associations are loaded

            // Then - Accessing associations should not trigger LazyInitializationException
            result.getContent().forEach(payment -> {
                assertThat(payment.getOrder()).isNotNull();
                assertThat(payment.getOrder().getReferenceNumber()).isNotNull();
                assertThat(payment.getOrder().getCustomer()).isNotNull();
                assertThat(payment.getOrder().getCustomer().getFirstName()).isNotNull();
                assertThat(payment.getReceivedBy()).isNotNull();
                assertThat(payment.getReceivedBy().getUsername()).isNotNull();
            });
        }
    }
}

