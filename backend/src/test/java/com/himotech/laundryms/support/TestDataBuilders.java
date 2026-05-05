package com.himotech.laundryms.support;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.service.CreateOrderCommand;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.service.RecordPaymentCommand;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.users.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Test data builders and factories for Phase 5 service unit tests.
 * Provides deterministic, minimal data for Given/When/Then scenarios.
 */
public final class TestDataBuilders {

    private static final String DUMMY_PASSWORD_HASH = "test-hash-" + UUID.randomUUID();

    private TestDataBuilders() {
    }

    // --- Customer ---

    public static Customer.CustomerBuilder customer() {
        return Customer.builder()
                .id(1L)
                .firstName("Juan")
                .lastName("Dela Cruz")
                .contactNumber("09171234567");
    }

    public static Customer customer(long id, String firstName, String lastName, String contactNumber) {
        return customer()
                .id(id)
                .firstName(firstName)
                .lastName(lastName)
                .contactNumber(contactNumber)
                .build();
    }

    // --- User ---

    public static User.UserBuilder user() {
        return User.builder()
                .id(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .username("staff1")
            .passwordHash(DUMMY_PASSWORD_HASH)
                .role(UserRole.STAFF)
                .firstName("Test")
                .lastName("Staff")
                .isActive(true);
    }

    public static User user(UUID id) {
        return user().id(id).build();
    }

    // --- ServiceRate ---

    public static ServiceRate.ServiceRateBuilder serviceRate() {
        return ServiceRate.builder()
                .id(1)
                .serviceName("Standard Wash")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true);
    }

    public static ServiceRate serviceRate(BigDecimal basePrice, BigDecimal kgLimit, BigDecimal pricePerExtra) {
        return serviceRate()
                .basePricePerLoad(basePrice)
                .kgLimitPerLoad(kgLimit)
                .pricePerExtraMinute(pricePerExtra)
                .build();
    }

    // --- Order ---

    public static Order.OrderBuilder order() {
        Customer c = customer().build();
        User u = user().build();
        ServiceRate r = serviceRate().build();
        return Order.builder()
                .id(1L)
                .referenceNumber("LDR-20260213-1234")
                .customer(c)
                .createdBy(u)
                .serviceRate(r)
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
                .paymentStatus(PaymentStatus.UNPAID);
    }

    public static Order order(Long id, String ref, OrderStatus status, BigDecimal grandTotal) {
        return order()
                .id(id)
                .referenceNumber(ref)
                .currentStatus(status)
                .grandTotal(grandTotal)
                .build();
    }

    // --- CreateOrderCommand ---

    public static CreateOrderCommand createOrderCommand(Long customerId, UUID userId, BigDecimal weightKg, int extraMinutes, List<CreateOrderCommand.AddOnItem> addOns) {
        return new CreateOrderCommand(customerId, userId, weightKg, extraMinutes, addOns, "STANDARD", null);
    }

    public static CreateOrderCommand createOrderCommand(Long customerId, UUID userId, BigDecimal weightKg, int extraMinutes) {
        return createOrderCommand(customerId, userId, weightKg, extraMinutes, null);
    }

    public static CreateOrderCommand createOrderCommandWithAddOns(Long customerId, UUID userId, BigDecimal weightKg, int extraMinutes, CreateOrderCommand.AddOnItem... items) {
        return new CreateOrderCommand(customerId, userId, weightKg, extraMinutes, List.of(items), "STANDARD", null);
    }

    // --- RecordPaymentCommand ---

    public static RecordPaymentCommand recordPaymentCommand(Long orderId, BigDecimal amountPaid, PaymentMethod method, UUID receivedByUserId, String remarks) {
        return new RecordPaymentCommand(orderId, amountPaid, method, receivedByUserId, remarks);
    }

    public static RecordPaymentCommand recordPaymentCommand(Long orderId, BigDecimal amountPaid, UUID receivedByUserId) {
        return recordPaymentCommand(orderId, amountPaid, PaymentMethod.CASH, receivedByUserId, null);
    }

    // --- Payment ---

    public static Payment.PaymentBuilder payment() {
        Order o = order().build();
        User u = user().build();
        return Payment.builder()
                .id(1L)
                .order(o)
                .amountPaid(new BigDecimal("240.00"))
                .paymentMethod(PaymentMethod.CASH)
                .receivedBy(u)
                .paymentDate(Instant.now());
    }
}
