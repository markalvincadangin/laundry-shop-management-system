package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
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
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration Tests for OrderSpecification filtering logic.
 *
 * <p>This test suite validates the dynamic predicate building in {@link OrderSpecification#filterBy}
 * to ensure it correctly handles:
 * <ul>
 *   <li>Null filter parameters (should be ignored)</li>
 *   <li>Non-null filter parameters (should be included in query)</li>
 *   <li>Enum parameters (OrderStatus, PaymentStatus) - prevents PostgreSQL 42P18 errors</li>
 *   <li>Date range filtering (fromTs, toTs)</li>
 *   <li>Multiple filter combinations</li>
 * </ul>
 *
 * <p><b>Context:</b> The Specification pattern was introduced to replace nullable-parameter JPQL queries
 * that caused PostgreSQL type determination issues (42P18 error: "could not determine data type of parameter").
 * These tests ensure the fix works correctly across all filter scenarios.
 *
 * @see OrderSpecification
 * @see AbstractIntegrationTest
 */
@DisplayName("OrderSpecification Filtering Integration Tests")
class OrderSpecificationIT extends AbstractIntegrationTest {

    private static final String DUMMY_PASSWORD_HASH = "it-hash-" + java.util.UUID.randomUUID();

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private User testUser;
    private Customer testCustomer;
    private ServiceRate testServiceRate;

    // Test orders with different characteristics
    private Order receivedUnpaidOrder;
    private Order washingUnpaidOrder;
    private Order readyPaidOrder;
    private Order releasedPaidOrder;
    private Order cancelledOrder;

    // Captured timestamps for deterministic date range testing
    private Instant earliestCreatedAt;
    private Instant latestCreatedAt;

    /**
     * Set up test data before each test.
     * Creates orders with various statuses and payment states for filtering tests.
     */
    @BeforeEach
    void setUp() {
        // Create foreign key dependencies
        testUser = User.builder()
                .username("teststaff_orderspec")
            .passwordHash(DUMMY_PASSWORD_HASH)
                .role(UserRole.STAFF)
                .firstName("Test")
                .lastName("Staff")
                .isActive(true)
                .build();
        testUser = entityManager.persist(testUser);

        testCustomer = Customer.builder()
                .firstName("John")
                .lastName("Doe")
                .contactNumber("09171234567")
                .build();
        testCustomer = entityManager.persist(testCustomer);

        // Use a unique service name to avoid conflict with seeded "Standard Wash" in V1__init.sql
        testServiceRate = ServiceRate.builder()
                .serviceName("OrderSpec Test Rate")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
        testServiceRate = entityManager.persist(testServiceRate);

        // Create test orders with different statuses and payment states
        receivedUnpaidOrder = createOrder("LDR-20260425-0001", OrderStatus.RECEIVED, PaymentStatus.UNPAID);
        washingUnpaidOrder = createOrder("LDR-20260425-0002", OrderStatus.WASHING, PaymentStatus.UNPAID);
        readyPaidOrder = createOrder("LDR-20260425-0003", OrderStatus.READY_FOR_PICKUP, PaymentStatus.PAID);
        releasedPaidOrder = createOrder("LDR-20260425-0004", OrderStatus.RELEASED, PaymentStatus.PAID);
        cancelledOrder = createOrder("LDR-20260425-0005", OrderStatus.CANCELLED, PaymentStatus.UNPAID);

        entityManager.flush();
        entityManager.clear();

        // Capture actual persisted timestamps for deterministic date range testing
        List<Order> allOrders = orderRepository.findAll();
        earliestCreatedAt = allOrders.stream()
                .map(Order::getCreatedAt)
                .min(Instant::compareTo)
                .orElseThrow();
        latestCreatedAt = allOrders.stream()
                .map(Order::getCreatedAt)
                .max(Instant::compareTo)
                .orElseThrow();
    }

    private Order createOrder(String refNumber, OrderStatus status, PaymentStatus paymentStatus) {
        Order order = Order.builder()
                .referenceNumber(refNumber)
                .customer(testCustomer)
                .createdBy(testUser)
                .serviceRate(testServiceRate)
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
                .currentStatus(status)
                .paymentStatus(paymentStatus)
                .build();
        return entityManager.persist(order);
    }

    /**
     * Test 1: All parameters null - should return all orders
     */
    @Test
    @DisplayName("filterBy - Should return all orders when all filters are null")
    void filterBy_ShouldReturnAllOrders_WhenAllFiltersAreNull() {
        // Given - All filter parameters are null
        Specification<Order> spec = OrderSpecification.filterBy(null, null, null, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return all 5 test orders
        assertThat(results).hasSize(5);
        assertThat(results).extracting(Order::getReferenceNumber)
                .containsExactlyInAnyOrder("LDR-20260425-0001", "LDR-20260425-0002", "LDR-20260425-0003", "LDR-20260425-0004", "LDR-20260425-0005");
    }

    /**
     * Test 2: Filter by OrderStatus only - validates enum parameter handling
     */
    @Test
    @DisplayName("filterBy - Should filter by OrderStatus enum when only status is provided")
    void filterBy_ShouldFilterByStatus_WhenOnlyStatusProvided() {
        // Given - Filter by WASHING status only
        Specification<Order> spec = OrderSpecification.filterBy(OrderStatus.WASHING, null, null, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return only the WASHING order
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReferenceNumber()).isEqualTo("LDR-20260425-0002");
        assertThat(results.get(0).getCurrentStatus()).isEqualTo(OrderStatus.WASHING);
    }

    /**
     * Test 3: Filter by PaymentStatus only - validates enum parameter handling
     */
    @Test
    @DisplayName("filterBy - Should filter by PaymentStatus enum when only payment status is provided")
    void filterBy_ShouldFilterByPaymentStatus_WhenOnlyPaymentStatusProvided() {
        // Given - Filter by PAID payment status only
        Specification<Order> spec = OrderSpecification.filterBy(null, PaymentStatus.PAID, null, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return only PAID orders
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Order::getReferenceNumber)
                .containsExactlyInAnyOrder("LDR-20260425-0003", "LDR-20260425-0004");
        assertThat(results).allMatch(order -> order.getPaymentStatus() == PaymentStatus.PAID);
    }

    /**
     * Test 4: Filter by both OrderStatus and PaymentStatus - validates enum combination
     */
    @Test
    @DisplayName("filterBy - Should filter by both status enums when both are provided")
    void filterBy_ShouldFilterByBothEnums_WhenBothStatusesProvided() {
        // Given - Filter by RECEIVED status AND UNPAID payment status
        Specification<Order> spec = OrderSpecification.filterBy(
                OrderStatus.RECEIVED,
                PaymentStatus.UNPAID,
                null,
                null,
                null,
                null,
                null
        );

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return only the order matching both criteria
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReferenceNumber()).isEqualTo("LDR-20260425-0001");
        assertThat(results.get(0).getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);
        assertThat(results.get(0).getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
    }

    /**
     * Test 5: Filter by fromTs (date range start) - validates timestamp filtering
     * Uses captured createdAt from persisted orders for deterministic assertions.
     */
    @Test
    @DisplayName("filterBy - Should filter by fromTs when date range start is provided")
    void filterBy_ShouldFilterByFromTimestamp_WhenFromTsProvided() {
        // Given - Set fromTs to just before earliest order
        Instant fromTs = earliestCreatedAt.minus(1, ChronoUnit.SECONDS);
        Specification<Order> spec = OrderSpecification.filterBy(null, null, fromTs, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return all orders created after fromTs
        assertThat(results).hasSize(5);
    }

    /**
     * Test 6: Filter by toTs (date range end) - validates timestamp filtering
     * Uses captured createdAt from persisted orders for deterministic assertions.
     */
    @Test
    @DisplayName("filterBy - Should filter by toTs when date range end is provided")
    void filterBy_ShouldFilterByToTimestamp_WhenToTsProvided() {
        // Given - Set toTs to just after latest order
        Instant toTs = latestCreatedAt.plus(1, ChronoUnit.SECONDS);
        Specification<Order> spec = OrderSpecification.filterBy(null, null, null, toTs, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return all orders created before toTs
        assertThat(results).hasSize(5);
    }

    /**
     * Test 7: Filter by date range (fromTs and toTs) - validates range filtering
     * Uses captured createdAt from persisted orders for deterministic assertions.
     */
    @Test
    @DisplayName("filterBy - Should filter by date range when both fromTs and toTs are provided")
    void filterBy_ShouldFilterByDateRange_WhenBothTimestampsProvided() {
        // Given - Date range covering all test orders
        Instant fromTs = earliestCreatedAt.minus(1, ChronoUnit.SECONDS);
        Instant toTs = latestCreatedAt.plus(1, ChronoUnit.SECONDS);
        Specification<Order> spec = OrderSpecification.filterBy(null, null, fromTs, toTs, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return all orders within the date range
        assertThat(results).hasSize(5);
    }

    /**
     * Test 8: Filter by date range excluding orders - validates boundary conditions
     * Uses captured createdAt from persisted orders for deterministic assertions.
     */
    @Test
    @DisplayName("filterBy - Should exclude orders outside date range")
    void filterBy_ShouldExcludeOrders_WhenOutsideDateRange() {
        // Given - Date range before test orders were created
        Instant fromTs = earliestCreatedAt.minus(2, ChronoUnit.HOURS);
        Instant toTs = earliestCreatedAt.minus(1, ChronoUnit.SECONDS);
        Specification<Order> spec = OrderSpecification.filterBy(null, null, fromTs, toTs, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return no orders
        assertThat(results).isEmpty();
    }

    /**
     * Test 9: Complex filter - all parameters provided
     * Uses captured createdAt from persisted orders for deterministic assertions.
     */
    @Test
    @DisplayName("filterBy - Should apply all filters when all parameters are provided")
    void filterBy_ShouldApplyAllFilters_WhenAllParametersProvided() {
        // Given - All filter parameters specified
        Instant fromTs = earliestCreatedAt.minus(1, ChronoUnit.SECONDS);
        Instant toTs = latestCreatedAt.plus(1, ChronoUnit.SECONDS);
        Specification<Order> spec = OrderSpecification.filterBy(
                OrderStatus.READY_FOR_PICKUP,
                PaymentStatus.PAID,
                fromTs,
                toTs,
                null,
                null,
                null
        );

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return only the order matching all criteria
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReferenceNumber()).isEqualTo("LDR-20260425-0003");
        assertThat(results.get(0).getCurrentStatus()).isEqualTo(OrderStatus.READY_FOR_PICKUP);
        assertThat(results.get(0).getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    /**
     * Test 10: Complex filter with no matches
     */
    @Test
    @DisplayName("filterBy - Should return empty list when no orders match all criteria")
    void filterBy_ShouldReturnEmptyList_WhenNoOrdersMatchAllCriteria() {
        // Given - Contradictory filters (RECEIVED + PAID - no such order exists)
        Specification<Order> spec = OrderSpecification.filterBy(
                OrderStatus.RECEIVED,
                PaymentStatus.PAID,
                null,
                null,
                null,
                null,
                null
        );

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return no orders
        assertThat(results).isEmpty();
    }

    /**
     * Test 11: Filter by CANCELLED status - validates edge case enum
     */
    @Test
    @DisplayName("filterBy - Should filter by CANCELLED status correctly")
    void filterBy_ShouldFilterByCancelledStatus_WhenStatusIsCancelled() {
        // Given - Filter by CANCELLED status
        Specification<Order> spec = OrderSpecification.filterBy(OrderStatus.CANCELLED, null, null, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should return only cancelled order
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReferenceNumber()).isEqualTo("LDR-20260425-0005");
        assertThat(results.get(0).getCurrentStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    /**
     * Test 12: Filter by multiple different statuses in sequence - validates enum handling stability
     */
    @Test
    @DisplayName("filterBy - Should handle multiple enum queries in sequence without PostgreSQL errors")
    void filterBy_ShouldHandleMultipleEnumQueries_WithoutPostgreSQLErrors() {
        // This test validates that the Specification approach prevents PostgreSQL 42P18 errors
        // by executing multiple queries with different enum values in sequence

        // Query 1: Filter by WASHING
        Specification<Order> spec1 = OrderSpecification.filterBy(OrderStatus.WASHING, null, null, null, null, null, null);
        List<Order> results1 = orderRepository.findAll(spec1);
        assertThat(results1).hasSize(1);
        assertThat(results1.get(0).getCurrentStatus()).isEqualTo(OrderStatus.WASHING);

        // Query 2: Filter by RECEIVED
        Specification<Order> spec2 = OrderSpecification.filterBy(OrderStatus.RECEIVED, null, null, null, null, null, null);
        List<Order> results2 = orderRepository.findAll(spec2);
        assertThat(results2).hasSize(1);
        assertThat(results2.get(0).getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);

        // Query 3: Filter by RELEASED
        Specification<Order> spec3 = OrderSpecification.filterBy(OrderStatus.RELEASED, null, null, null, null, null, null);
        List<Order> results3 = orderRepository.findAll(spec3);
        assertThat(results3).hasSize(1);
        assertThat(results3.get(0).getCurrentStatus()).isEqualTo(OrderStatus.RELEASED);

        // All queries should succeed without PostgreSQL type determination errors
    }

    /**
     * Test 13: Filter with null status but non-null payment status - validates selective filtering
     */
    @Test
    @DisplayName("filterBy - Should handle mix of null and non-null enum parameters")
    void filterBy_ShouldHandleMixedNullAndNonNullEnums_Correctly() {
        // Given - Null OrderStatus, non-null PaymentStatus
        Specification<Order> spec = OrderSpecification.filterBy(null, PaymentStatus.UNPAID, null, null, null, null, null);

        // When
        List<Order> results = orderRepository.findAll(spec);

        // Then - Should filter only by payment status, ignore null order status
        assertThat(results).hasSize(3);
        assertThat(results).extracting(Order::getReferenceNumber)
                .containsExactlyInAnyOrder("LDR-20260425-0001", "LDR-20260425-0002", "LDR-20260425-0005");
        assertThat(results).allMatch(order -> order.getPaymentStatus() == PaymentStatus.UNPAID);
    }
}
