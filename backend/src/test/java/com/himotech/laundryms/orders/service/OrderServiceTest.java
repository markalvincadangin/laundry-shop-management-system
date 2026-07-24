package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.rates.entity.AddOnCatalog;
import com.himotech.laundryms.rates.repository.AddOnCatalogRepository;
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
 * Covers: US-01, US-02, BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-04, BR-OL-01, BR-OL-02, BR-NOTIF-02.
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
    private AddOnCatalogRepository addOnCatalogRepository;

    @InjectMocks
    private OrderService orderService;

    private static final UUID CUSTOMER_ID = UUID.randomUUID();
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
        when(orderRepository.existsByTrackingNumber(anyString())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) {
                o.setId(UUID.randomUUID());
            }
            return o;
        });
        
        when(addOnCatalogRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.empty());
    }

    @Nested
    @DisplayName("create - Happy Path (US-01, US-02, BR-OL-01, BR-OL-02)")
    class CreateHappyPath {

        @Test
        @DisplayName("Should persist order when valid command")
        void createShouldpersistorderWhenvalidcommand() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("10.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isNotNull();
            assertThat(result.getTrackingNumber()).startsWith("LDR-");
            assertThat(result.getCurrentStatus()).isEqualTo(OrderStatus.RECEIVED);  // BR-OL-02
            assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
            assertThat(result.getCustomer()).isEqualTo(customer);
            assertThat(result.getCreatedBy()).isEqualTo(user);
            assertThat(result.getServiceRate()).isEqualTo(serviceRate);
            verify(orderRepository).save(any(Order.class));
        }

        @Test
        @DisplayName("Should auto-add Rush Fee when isRush is true")
        void createShouldaddRushFeeWhenisRushtrue() {
            // Given - 1 load (8kg)
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, true);
            var rushFee = new AddOnCatalog();
            rushFee.setId(UUID.randomUUID());
            rushFee.setName("Rush Fee");
            rushFee.setDefaultPrice(new BigDecimal("50.00"));
            rushFee.setIsActive(true);
            when(addOnCatalogRepository.findByNameIgnoreCase("Rush Fee")).thenReturn(Optional.of(rushFee));

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getIsRush()).isTrue();
            assertThat(result.getAddOns()).hasSize(1);
            assertThat(result.getAddOns().get(0).getName()).isEqualTo("Rush Fee");
            assertThat(result.getAddOns().get(0).getPrice()).isEqualTo(new BigDecimal("50.00"));
            
            // Grand Total = 140 (base) + 50 (rush fee) = 190
            assertThat(result.getGrandTotal()).isEqualByComparingTo("190.00");
        }

        @Test
        @DisplayName("Edge Case: Should set isRush but NOT add Rush Fee if AddOn is inactive")
        void createShouldNotAddRushFeeWhenAddOnIsInactive() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, true);
            var rushFee = new AddOnCatalog();
            rushFee.setId(UUID.randomUUID());
            rushFee.setName("Rush Fee");
            rushFee.setDefaultPrice(new BigDecimal("50.00"));
            rushFee.setIsActive(false);
            when(addOnCatalogRepository.findByNameIgnoreCase("Rush Fee")).thenReturn(Optional.of(rushFee));

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getIsRush()).isTrue();
            assertThat(result.getAddOns()).isEmpty(); // No add-ons added
            
            // Grand Total = 140 (base only)
            assertThat(result.getGrandTotal()).isEqualByComparingTo("140.00");
        }

        @Test
        @DisplayName("Edge Case: Should set isRush but NOT add Rush Fee if AddOn is missing")
        void createShouldNotAddRushFeeWhenAddOnIsMissing() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, true);
            when(addOnCatalogRepository.findByNameIgnoreCase("Rush Fee")).thenReturn(Optional.empty()); // MISSING

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getIsRush()).isTrue();
            assertThat(result.getAddOns()).isEmpty(); // No add-ons added
            
            // Grand Total = 140 (base only)
            assertThat(result.getGrandTotal()).isEqualByComparingTo("140.00");
        }

        @Test
        @DisplayName("Should use default active ServiceRate (BR-PR-01)")
        void createShouldgenerateuniquereferenceWhencreatingorder() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("5.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTrackingNumber()).matches("LDR-\\d{8}-\\d{4}");
            verify(orderRepository).existsByTrackingNumber(result.getTrackingNumber());
        }
    }

    @Nested
    @DisplayName("create - Pricing (BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-04)")
    class CreatePricing {

        @Test
        @DisplayName("Should compute total_loads = ceil(weight/8) - exactly 8kg = 1 load (BR-PR-02)")
        void createShouldcomputetotalloadsExactly8kgequals1load() {
            // Given - weight exactly 8 kg
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(1);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("140.00"); // 1 load × ₱140 (BR-PR-01)
        }

        @Test
        @DisplayName("Should compute total_loads = ceil(weight/8) - 8.01kg = 2 loads (BR-PR-02)")
        void createShouldcomputetotalloads8point01kgequals2loads() {
            // Given - weight just over 8 kg
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.01"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(2);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("280.00"); // 2 loads × ₱140
        }

        @Test
        @DisplayName("Should compute total_loads - 16kg = 2 loads (BR-PR-02)")
        void createShouldcomputetotalloads16kgequals2loads() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("16.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(2);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("280.00"); // 2 loads × ₱140
        }

        @Test
        @DisplayName("Should compute base_amount = loads × 140 (BR-PR-01)")
        void createShouldcomputebaseamountFromloadsandrate() {
            // Given - 3 loads at 20kg (ceil(20/8) = 3)
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("20.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getTotalLoads()).isEqualTo(3);
            assertThat(result.getBaseAmount()).isEqualByComparingTo("420.00"); // 3 loads × ₱140 (BR-PR-01)
        }

        @Test
        @DisplayName("Should compute extra_minutes_amount = extra × 1 when extra minutes given (BR-PR-03)")
        void createShouldcomputeextraminutesamountWhenextraminutesgiven() {
            // Given - 10 extra minutes
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 10, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getExtraMinutes()).isEqualTo(10);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo("10.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("150.00");  // ₱140 base + ₱10 extra
        }

        @Test
        @DisplayName("Should compute extra_minutes_amount = 0 when extra_minutes = 0 (BR-PR-03)")
        void createShouldcomputezeroextraminutesWhenextraminuteszero() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, false);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.getGrandTotal()).isEqualByComparingTo("140.00"); // 1 load × ₱140
        }

        @Test
        @DisplayName("Should include add-ons in grand_total (BR-PR-04)")
        void createShouldincludeaddonsingrandtotal() {
            // Given - 1 load + fabric conditioner ₱20
            var addOn = new CreateOrderCommand.AddOnItem("Fabric Conditioner", new BigDecimal("20.00"), 1);
            var command = TestDataBuilders.createOrderCommandWithAddOns(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, addOn);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("20.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("160.00");  // ₱140 base + ₱20 addon
            assertThat(result.getAddOns()).hasSize(1);
            assertThat(result.getAddOns().get(0).getName()).isEqualTo("Fabric Conditioner");
            assertThat(result.getAddOns().get(0).getPrice()).isEqualByComparingTo("20.00");
        }

        @Test
        @DisplayName("Should sum multiple add-ons with quantity (BR-PR-04)")
        void createShouldsumaddonswithquantity() {
            // Given - 2× conditioner @ ₱15
            var addOn = new CreateOrderCommand.AddOnItem("Conditioner", new BigDecimal("15.00"), 2);
            var command = TestDataBuilders.createOrderCommandWithAddOns(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, addOn);

            // When
            Order result = orderService.create(command);

            // Then
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("30.00");
            assertThat(result.getGrandTotal()).isEqualByComparingTo("170.00"); // ₱140 base + ₱30 (2×15)
        }

        @Test
        @DisplayName("Should snapshot pricing from active ServiceRate")
        void createShouldsnapshotpricingfromservicerate() {
            // Given - custom rate
            var customRate = TestDataBuilders.serviceRate(
                    new BigDecimal("150.00"),
                    new BigDecimal("10.00"),
                    new BigDecimal("2.00")
            );
            when(serviceRateService.getActiveRate()).thenReturn(customRate);
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("10.00"), 5, null, null, null, false);

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
        void createShouldrejectWhenweightnull() {
            // Given
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, null, 0, null, null, null, false);

            // When/Then
            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should reject when weight is zero")
        void createShouldrejectWhenweightzero() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, BigDecimal.ZERO, 0, null, null, null, false);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
        }

        @Test
        @DisplayName("Should reject when weight is negative")
        void createShouldrejectWhenweightnegative() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("-1.00"), 0, null, null, null, false);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Weight must be greater than 0");
        }

        @Test
        @DisplayName("Should reject when extra_minutes is negative")
        void createShouldrejectWhenextraminutesnegative() {
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), -1, null, null, null, false);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Extra minutes cannot be negative");
        }

        @Test
        @DisplayName("Should throw when customer not found (US-01)")
        void createShouldthrowWhencustomernotfound() {
            when(customerRepository.findById(CUSTOMER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, false);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Customer not found");
        }

        @Test
        @DisplayName("Should throw when user not found (US-01)")
        void createShouldthrowWhenusernotfound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());
            var command = TestDataBuilders.createOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, false);

            assertThatThrownBy(() -> orderService.create(command))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("findByTrackingNumber - Tracking (BR-NOTIF-02)")
    class FindByTrackingNumber {

        @Test
        @DisplayName("Should return order when valid reference number provided (BR-NOTIF-02)")
        void findByTrackingNumberShouldreturnorderWhenvalid() {
            Order mockOrder = TestDataBuilders.order().id(UUID.randomUUID()).trackingNumber("LDR-20260220-1234").build();
            when(orderRepository.findByTrackingNumber("LDR-20260220-1234")).thenReturn(Optional.of(mockOrder));

            Order result = orderService.findByTrackingNumber("LDR-20260220-1234");

            assertThat(result).isNotNull();
            assertThat(result.getTrackingNumber()).isEqualTo("LDR-20260220-1234");
        }

        @Test
        @DisplayName("Should throw NotFoundException when reference number is invalid (BR-NOTIF-02)")
        void findByTrackingNumberShouldthrowWheninvalid() {
            when(orderRepository.findByTrackingNumber("INVALID-REF")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.findByTrackingNumber("INVALID-REF"))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found for reference: INVALID-REF");
        }
    }

    @Nested
    @DisplayName("create - Add-ons edge cases")
    class CreateAddOnsEdgeCases {

        @Test
        @DisplayName("Should handle null addOns as empty list")
        void createShouldhandlenulladdonsAsemptylist() {
            var command = new CreateOrderCommand(CUSTOMER_ID, USER_ID, new BigDecimal("8.00"), 0, null, null, null, false);

            Order result = orderService.create(command);

            assertThat(result.getAddOns()).isEmpty();
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("update - Order update functionality (BR-OL-06)")
    class UpdateOrder {

        private Order existingOrder;

        @BeforeEach
        void setUpOrder() {
            // Create an unpaid, not-released order for updating
            existingOrder = TestDataBuilders.order()
                    .id(UUID.randomUUID())
                    .extraMinutes(5)
                    .extraMinutesAmount(new BigDecimal("5.00"))
                    .grandTotal(new BigDecimal("285.00"))  // baseAmount=280 + extra=5
                    .currentStatus(OrderStatus.RECEIVED)
                    .paymentStatus(PaymentStatus.UNPAID)
                    .build();

            when(orderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        }

        @Test
        @DisplayName("Should update extra minutes and recalculate totals (BR-OL-06)")
        void updateShouldupdateextraminutesandrecalculatetotals() {
            // Given - update extra minutes from 5 to 10
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(10);

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then
            assertThat(result.getExtraMinutes()).isEqualTo(10);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo("10.00");
            // baseAmount=280 + extraMinutes=10 + addons=0 = 290
            assertThat(result.getGrandTotal()).isEqualByComparingTo("290.00");
            verify(orderRepository).save(existingOrder);
        }

        @Test
        @DisplayName("Should update add-ons and recalculate totals (BR-OL-06)")
        void updateShouldupdateaddonsandrecalculatetotals() {
            // Given - add new add-on
            com.himotech.laundryms.orders.dto.AddOnInput addOn1 = 
                new com.himotech.laundryms.orders.dto.AddOnInput();
            addOn1.setName("Fabric Conditioner");
            addOn1.setPrice(new BigDecimal("20.00"));
            addOn1.setQuantity(1);

            com.himotech.laundryms.orders.dto.AddOnInput addOn2 = 
                new com.himotech.laundryms.orders.dto.AddOnInput();
            addOn2.setName("Extra Detergent");
            addOn2.setPrice(new BigDecimal("15.00"));
            addOn2.setQuantity(2);

            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setAddOns(List.of(addOn1, addOn2));

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then
            assertThat(result.getAddOns()).hasSize(2);
            // addons = 20 + (15*2) = 50
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("50.00");
            // baseAmount=280 + extraMinutes=5 + addons=50 = 335
            assertThat(result.getGrandTotal()).isEqualByComparingTo("335.00");
        }

        @Test
        @DisplayName("Should update both extra minutes and add-ons together (BR-OL-06)")
        void updateShouldupdateextraminutesandaddonstogether() {
            // Given
            com.himotech.laundryms.orders.dto.AddOnInput addOn = 
                new com.himotech.laundryms.orders.dto.AddOnInput();
            addOn.setName("Conditioner");
            addOn.setPrice(new BigDecimal("25.00"));
            addOn.setQuantity(1);

            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(15);
            request.setAddOns(List.of(addOn));

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then
            assertThat(result.getExtraMinutes()).isEqualTo(15);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo("15.00");
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("25.00");
            // baseAmount=280 + extraMinutes=15 + addons=25 = 320
            assertThat(result.getGrandTotal()).isEqualByComparingTo("320.00");
        }

        @Test
        @DisplayName("Should reject update when order is already paid (BR-OL-06)")
        void updateShouldrejectWhenorderalreadypaid() {
            // Given - order is paid
            existingOrder.setPaymentStatus(PaymentStatus.PAID);
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(10);

            // When/Then
            assertThatThrownBy(() -> orderService.update(existingOrder.getId(), request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot update order: already paid");
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should reject update when order is already released (BR-OL-06)")
        void updateShouldrejectWhenorderalreadyreleased() {
            // Given - order is released
            existingOrder.setCurrentStatus(OrderStatus.RELEASED);
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(10);

            // When/Then
            assertThatThrownBy(() -> orderService.update(existingOrder.getId(), request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot update order: already released");
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should reject when extra minutes is negative (BR-OL-06)")
        void updateShouldrejectWhenextraminutesnegative() {
            // Given
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(-5);

            // When/Then
            assertThatThrownBy(() -> orderService.update(existingOrder.getId(), request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Extra minutes cannot be negative");
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should allow updating extra minutes to zero (BR-OL-06)")
        void updateShouldallowzeroextraminutes() {
            // Given - reduce extra minutes to 0
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(0);

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then
            assertThat(result.getExtraMinutes()).isEqualTo(0);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            // baseAmount=280 + extraMinutes=0 + addons=0 = 280
            assertThat(result.getGrandTotal()).isEqualByComparingTo("280.00");
        }

        @Test
        @DisplayName("Should handle null extra minutes (keep existing value) (BR-OL-06)")
        void updateShouldkeepexistingextraminutesWhennotprovided() {
            // Given - don't update extra minutes
            com.himotech.laundryms.orders.dto.AddOnInput addOn = 
                new com.himotech.laundryms.orders.dto.AddOnInput();
            addOn.setName("Test");
            addOn.setPrice(new BigDecimal("10.00"));
            addOn.setQuantity(1);

            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(null);
            request.setAddOns(List.of(addOn));

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then - extra minutes stays at 5
            assertThat(result.getExtraMinutes()).isEqualTo(5);
            assertThat(result.getExtraMinutesAmount()).isEqualByComparingTo("5.00");
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("10.00");
            // baseAmount=280 + extraMinutes=5 + addons=10 = 295
            assertThat(result.getGrandTotal()).isEqualByComparingTo("295.00");
        }

        @Test
        @DisplayName("Should keep existing add-ons when null add-ons list provided (BR-OL-06)")
        void updateShouldkeepexistingaddonsWhennulladdonsprovided() {
            // Given - order has existing add-ons
            existingOrder.getAddOns().add(
                com.himotech.laundryms.orders.entity.OrderAddOn.builder()
                    .order(existingOrder)
                    .name("Existing AddOn")
                    .price(new BigDecimal("30.00"))
                    .quantity(1)
                    .build()
            );
            existingOrder.setAddonsTotalAmount(new BigDecimal("30.00"));
            existingOrder.setGrandTotal(new BigDecimal("315.00")); // 280 + 5 + 30

            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(10);
            request.setAddOns(null); // Don't update add-ons

            // When
            Order result = orderService.update(existingOrder.getId(), request);

            // Then - add-ons remain
            assertThat(result.getAddOns()).hasSize(1);
            assertThat(result.getAddonsTotalAmount()).isEqualByComparingTo("30.00");
            assertThat(result.getExtraMinutes()).isEqualTo(10);
            // baseAmount=280 + extraMinutes=10 + addons=30 = 320
            assertThat(result.getGrandTotal()).isEqualByComparingTo("320.00");
        }

        @Test
        @DisplayName("Should throw NotFoundException when order does not exist (BR-OL-06)")
        void updateShouldthrowWhenordernotfound() {
            // Given
            UUID missingId = UUID.randomUUID();
            when(orderRepository.findById(missingId)).thenReturn(Optional.empty());
            com.himotech.laundryms.orders.dto.UpdateOrderRequest request = 
                new com.himotech.laundryms.orders.dto.UpdateOrderRequest();
            request.setExtraMinutes(10);

            // When/Then
            assertThatThrownBy(() -> orderService.update(missingId, request))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found: " + missingId);
            verify(orderRepository, never()).save(any());
        }
    }
}
