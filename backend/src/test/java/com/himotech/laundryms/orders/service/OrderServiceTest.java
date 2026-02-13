package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderStatusLogRepository;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.service.ServiceRateService;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for OrderService.
 * Covers: US-01, US-02, BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-04, BR-OL-01, BR-OL-02.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("OrderService Unit Tests")
class OrderServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceRateService serviceRateService;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderStatusLogRepository orderStatusLogRepository;

    @InjectMocks
    private OrderService orderService;

    private static final Long CUSTOMER_ID = 1L;
    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private Customer customer;
    private User user;
    private ServiceRate serviceRate;

    @BeforeEach
    void setUp() {
        customer = TestDataBuilders.customer().build();
        user = TestDataBuilders.user().build();
        serviceRate = TestDataBuilders.serviceRate().build();

        when(customerRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customer));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(serviceRateService.getActiveRate()).thenReturn(serviceRate);
        when(orderRepository.existsByReferenceNumber(anyString())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) {
                o.setId(1L);
            }
            return o;
        });
    }

    @Nested
    @DisplayName("create - Happy Path (US-01, US-02, BR-OL-01, BR-OL-02)")
    class CreateHappyPath {

        @Test
        @DisplayName("Should persist order when valid command")
        void create_ShouldPersistOrder_WhenValidCommand() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("10.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isNotNull();
            assertThat(result.getReferenceNumber()).startsWith("LDR-");
            assertThat(result.getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);  // BR-OL-02
            assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
            assertThat(result.getCustomer()).isEqualTo(customer);
            assertThat(result.getCreatedBy()).isEqualTo(user);
            assertThat(result.getServiceRate()).isEqualTo(serviceRate);
            verify(orderRepository).save(any(Order.class));
            verify(orderStatusLogRepository).save(any());
        }

        @Test
        @DisplayName("Should generate unique reference number (BR-OL-01)")
        void create_ShouldGenerateUniqueReference_WhenCreatingOrder() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("5.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getReferenceNumber()).matches("LDR-\\d{8}-\\d{4}");
            verify(orderRepository).existsByReferenceNumber(result.getReferenceNumber());
        }
    }

    @Nested
    @DisplayName("create - Pricing (BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-04)")
    class CreatePricing {

        @Test
        @DisplayName("Should compute total_loads = ceil(weight/8) - exactly 8kg = 1 load (BR-PR-02)")
        void create_ShouldComputeTotalLoads_Exactly8kgEquals1Load() {
            // Given - weight exactly 8 kg
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(1);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("120.00");
        }

        @Test
        @DisplayName("Should compute total_loads = ceil(weight/8) - 8.01kg = 2 loads (BR-PR-02)")
        void create_ShouldComputeTotalLoads_8Point01kgEquals2Loads() {
            // Given - weight just over 8 kg
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.01"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(2);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("240.00");
        }

        @Test
        @DisplayName("Should compute total_loads - 16kg = 2 loads (BR-PR-02)")
        void create_ShouldComputeTotalLoads_16kgEquals2Loads() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("16.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(2);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("240.00");
        }

        @Test
        @DisplayName("Should compute base_amount = loads × 120 (BR-PR-01)")
        void create_ShouldComputeBaseAmount_FromLoadsAndRate() {
            // Given - 3 loads
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("20.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(3);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("360.00");
        }

        @Test
        @DisplayName("Should compute extra_minutes_amount = extra × 1 when extra minutes given (BR-PR-03)")
        void create_ShouldComputeExtraMinutesAmount_WhenExtraMinutesGiven() {
            // Given - 10 extra minutes
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 10);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getExtraMinutes()).isEqualTo(10);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo("10.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("130.00");  // 120 + 10
        }

        @Test
        @DisplayName("Should compute extra_minutes_amount = 0 when extra_minutes = 0 (BR-PR-03)")
        void create_ShouldComputeZeroExtraMinutes_WhenExtraMinutesZero() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.getGrandTotal()).isEqualByComparingTo("120.00");
        }

        @Test
        @DisplayName("Should include add-ons in grand_total (BR-PR-04)")
        void create_ShouldIncludeAddOnsInGrandTotal() {
            // Given - 1 load + fabric conditioner ₱20
            var addOn = new CreateOrderCommand.AddOnItem("Fabric Conditioner", new BigDecimal("20.00"), 1);
            var command = TestDataBuilders.createOrderCommandWithAddOns(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, addOn);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("20.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("140.00");  // 120 + 20
            assertThat(result.getAddOns()).hasSize(1);
            assertThat(result.getAddOns().get(0).getName()).isEqualTo("Fabric Conditioner");
            assertThat(result.getAddOns().get(0).getPrice()).isEqualByComparingTo("20.00");
        }

        @Test
        @DisplayName("Should sum multiple add-ons with quantity (BR-PR-04)")
        void create_ShouldSumAddOnsWithQuantity() {
            // Given - 2× conditioner @ ₱15
            var addOn = new CreateOrderCommand.AddOnItem("Conditioner", new BigDecimal("15.00"), 2);
            var command = TestDataBuilders.createOrderCommandWithAddOns(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, addOn);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("30.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("150.00");
        }

        @Test
        @DisplayName("Should snapshot pricing from active ServiceRate")
        void create_ShouldSnapshotPricingFromServiceRate() {
            // Given - custom rate
            var customRate = TestDataBuilders.serviceRate(
                    new BigDecimal("150.00"),
                    new BigDecimal("10.00"),
                    new BigDecimal("2.00")
            );
            when(serviceRateService.getActiveRate()).thenReturn(customRate);
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("10.00"), 5);

            // When
            Order result = orderService.create(command);

            // Then - snapshot fields match rate
            assertThat(result.getBasePricePerLoad()).isEqualByComparingTo("150.00");
            assertThat(result.getKgLimitPerLoad()).isEqualByComparingTo("10.00");
            assertThat(result.getPricePerExtraMinute()).isEqualByComparingTo("2.00");
            // 10kg / 10 = 1 load, base=150, extra=5*2=10, total=160
            assertThat(result.getTotalLoads()).isEqualTo(1);
            assertThat(result.getGrandTotal()).isEqualByComparingTo("160.00");
        }
    }

    @Nested
    @DisplayName("create - Invalid Inputs")
    class CreateInvalidInputs {

        @Test
        @DisplayName("Should reject when weight is null")
        void create_ShouldReject_WhenWeightNull() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, null, 0);

            // When/Then
            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should reject when weight is zero")
        void create_ShouldReject_WhenWeightZero() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, BigDecimal.ZERO, 0);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
        }

        @Test
        @DisplayName("Should reject when weight is negative")
        void create_ShouldReject_WhenWeightNegative() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("-1.00"), 0);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
        }

        @Test
        @DisplayName("Should reject when extra_minutes is negative")
        void create_ShouldReject_WhenExtraMinutesNegative() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), -1);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Extra minutes cannot be negative");
        }

        @Test
        @DisplayName("Should throw when customer not found (US-01)")
        void create_ShouldThrow_WhenCustomerNotFound() {
            when(customerRepository.findById(CUSTOMER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Customer not found");
        }

        @Test
        @DisplayName("Should throw when user not found (US-01)")
        void create_ShouldThrow_WhenUserNotFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("create - Add-ons edge cases")
    class CreateAddOnsEdgeCases {

        @Test
        @DisplayName("Should handle null addOns as empty list")
        void create_ShouldHandleNullAddOns_AsEmptyList() {
            var command = new CreateOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null);

            Order result = orderService.create(command);

            assertThat(result.getAddOns()).isEmpty();
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}
