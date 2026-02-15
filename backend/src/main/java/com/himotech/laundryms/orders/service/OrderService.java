package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.api.dto.request.CreateOrderRequest;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.entity.OrderAddOn;
import com.himotech.laundryms.orders.entity.OrderStatusLog;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderStatusLogRepository;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.service.ServiceRateService;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final ServiceRateService serviceRateService;
    private final OrderRepository orderRepository;
    private final OrderStatusLogRepository orderStatusLogRepository;

    private static final int MAX_REFERENCE_ATTEMPTS = 10;

    private String generateUniqueReferenceNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
        Random random = new Random();
        for (int attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
            int suffix = 1000 + random.nextInt(9000); // 1000-9999
            String ref = "LDR-" + datePart + "-" + suffix;
            if (!orderRepository.existsByReferenceNumber(ref)) {
                return ref;
            }
        }
        throw new IllegalStateException("Could not generate unique reference number after " + MAX_REFERENCE_ATTEMPTS + " attempts");
    }

    /**
     * Creates an order from a CreateOrderRequest DTO.
     * Handles customer resolution (existing or new) and add-on normalization.
     * 
     * @param request the order creation request
     * @return the created order
     */
    @Transactional
    public Order createFromRequest(CreateOrderRequest request) {
        // Resolve customer ID
        Long customerId = resolveCustomerId(request);
        
        // Normalize add-ons
        List<CreateOrderCommand.AddOnItem> addOns = normalizeAddOns(request);
        
        // Build command
        CreateOrderCommand command = new CreateOrderCommand(
                customerId,
                request.getCreatedByUserId(),
                request.getWeightKg(),
                request.getExtraMinutes() != null ? request.getExtraMinutes() : 0,
                addOns
        );
        
        return create(command);
    }

    /**
     * Resolves the customer ID from the request.
     * Either uses the provided customerId or creates a new customer.
     * 
     * @param request the order creation request
     * @return the customer ID
     * @throws IllegalArgumentException if neither customerId nor customer is provided
     */
    private Long resolveCustomerId(CreateOrderRequest request) {
        if (request.getCustomerId() != null) {
            return request.getCustomerId();
        }
        
        if (request.getCustomer() != null) {
            Customer customer = customerService.create(
                    request.getCustomer().getFirstName(),
                    request.getCustomer().getLastName(),
                    request.getCustomer().getContactNumber()
            );
            return customer.getId();
        }
        
        throw new IllegalArgumentException("Either customerId or customer is required");
    }

    /**
     * Normalizes add-ons from the request.
     * Sets quantity to 1 if not provided or zero.
     * 
     * @param request the order creation request
     * @return normalized list of add-on items
     */
    private List<CreateOrderCommand.AddOnItem> normalizeAddOns(CreateOrderRequest request) {
        if (request.getInitialAddOns() == null) {
            return List.of();
        }
        
        return request.getInitialAddOns().stream()
                .map(a -> new CreateOrderCommand.AddOnItem(
                        a.getName(),
                        a.getPrice(),
                        a.getQuantity() > 0 ? a.getQuantity() : 1
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public Order create(CreateOrderCommand command) {
        Customer customer = customerRepository.findById(command.customerId())
                .orElseThrow(() -> new NotFoundException("Customer not found: " + command.customerId()));
        User createdBy = userRepository.findById(command.createdByUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + command.createdByUserId()));
        ServiceRate rate = serviceRateService.getActiveRate();

        if (command.weightKg() == null || command.weightKg().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Weight must be greater than 0");
        }
        if (command.extraMinutes() < 0) {
            throw new IllegalArgumentException("Extra minutes cannot be negative");
        }

        int totalLoads = command.weightKg()
                .divide(rate.getKgLimitPerLoad(), 10, RoundingMode.HALF_UP)
                .setScale(0, RoundingMode.CEILING)
                .intValue();

        BigDecimal baseAmount = rate.getBasePricePerLoad()
                .multiply(BigDecimal.valueOf(totalLoads))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal extraMinutesAmount = rate.getPricePerExtraMinute()
                .multiply(BigDecimal.valueOf(command.extraMinutes()))
                .setScale(2, RoundingMode.HALF_UP);

        List<CreateOrderCommand.AddOnItem> addOnList = command.addOns() != null ? command.addOns() : List.of();
        BigDecimal addonsTotalAmount = addOnList.stream()
                .map(addOnItem -> addOnItem.price().multiply(BigDecimal.valueOf(addOnItem.quantity())).setScale(2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grandTotal = baseAmount.add(extraMinutesAmount).add(addonsTotalAmount);


        Order order = Order.builder()
                .referenceNumber(generateUniqueReferenceNumber())
                .customer(customer)
                .createdBy(createdBy)
                .serviceRate(rate)
                .weightKg(command.weightKg())
                .totalLoads(totalLoads)
                .basePricePerLoad(rate.getBasePricePerLoad())
                .kgLimitPerLoad(rate.getKgLimitPerLoad())
                .pricePerExtraMinute(rate.getPricePerExtraMinute())
                .extraMinutes(command.extraMinutes())
                .baseAmount(baseAmount)
                .extraMinutesAmount(extraMinutesAmount)
                .addonsTotalAmount(addonsTotalAmount)
                .grandTotal(grandTotal)
                .currentStatus(OrderStatus.RECEIVED)   // BR-OL-02
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        for (CreateOrderCommand.AddOnItem item : addOnList) {
            order.getAddOns().add(OrderAddOn.builder()
                    .order(order)
                    .name(item.name())
                    .price(item.price())
                    .quantity(item.quantity())
                    .build());
        }

        order = orderRepository.save(order);

        log.info("Order created successfully: Reference={}, Customer={} {}, Total=₱{}", 
                order.getReferenceNumber(), 
                customer.getFirstName(), 
                customer.getLastName(), 
                order.getGrandTotal());

        OrderStatusLog initialLog = OrderStatusLog.builder()
                .order(order)
                .previousStatus(null)
                .newStatus(OrderStatus.RECEIVED)
                .changedBy(createdBy)
                .changedAt(LocalDateTime.now())
                .build();
        orderStatusLogRepository.save(initialLog);

        return order;
    }

    @Transactional(readOnly = true)
    public Order findById(Long id) {
        return orderRepository.findByIdWithStatusLogs(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
    }

    @Transactional(readOnly = true)
    public Order findByReferenceNumber(String referenceNumber) {
        return orderRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new NotFoundException("Order not found for reference: " + referenceNumber));
    }

    @Transactional(readOnly = true)
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Order> findAll(
            OrderStatus status,
            PaymentStatus paymentStatus,
            java.time.LocalDate from,
            java.time.LocalDate to,
            Pageable pageable) {
        java.time.LocalDateTime fromTs = from != null ? from.atStartOfDay() : null;
        java.time.LocalDateTime toTs = to != null ? to.plusDays(1).atStartOfDay() : null;
        return orderRepository.findAllFiltered(status, paymentStatus, fromTs, toTs, pageable);
    }

}

