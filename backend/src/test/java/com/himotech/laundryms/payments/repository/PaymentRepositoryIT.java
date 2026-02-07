package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.payments.entity.Payment;
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
                .passwordHash("$2a$10$hashedpassword")
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
                .paymentDate(LocalDateTime.now())
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
                .paymentDate(LocalDateTime.now())
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
                .paymentDate(LocalDateTime.now())
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
                .paymentDate(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);
        entityManager.flush();
        entityManager.clear();

        // When
        boolean exists = paymentRepository.existsByOrderId(testOrder.getId());

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsByOrderId_ShouldReturnFalse_WhenNoPaymentExists")
    void existsByOrderId_ShouldReturnFalse_WhenNoPaymentExists() {
        // Given - No payment for the order (setUp created unpaid order)

        // When
        boolean exists = paymentRepository.existsByOrderId(testOrder.getId());

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
                .paymentDate(LocalDateTime.now())
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
                .paymentDate(LocalDateTime.now())
                .build();

        // When/Then - Should fail due to FK constraint
        assertThatThrownBy(() -> {
            paymentRepository.save(payment);
            entityManager.flush();
        })
                .isInstanceOf(Exception.class);
    }
}

