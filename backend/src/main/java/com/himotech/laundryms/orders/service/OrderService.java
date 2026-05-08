package com.himotech.laundryms.orders.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.api.dto.request.CreateOrderRequest;
import com.himotech.laundryms.api.dto.request.OrderPreviewRequest;
import com.himotech.laundryms.api.dto.request.UpdateOrderRequest;
import com.himotech.laundryms.api.dto.response.OrderPreviewResponse;
import com.himotech.laundryms.api.dto.response.OrderStatsResponse;
import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.orders.entity.OrderAddOn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderSpecification;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.service.ServiceRateService;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.mapper.OrderMapper;
import com.himotech.laundryms.auditlog.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Set;
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
    private final PaymentRepository paymentRepository;
    private final AuditLogService auditLogService;
    private final OrderMapper orderMapper;

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
                addOns,
                request.getServiceType(),
                request.getNotes()
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

    @Auditable(action = "ORDER_CREATE", description = "Create new laundry order")
    @Transactional
    public Order create(CreateOrderCommand command) {
        Customer customer = customerRepository.findById(command.customerId())
                .orElseThrow(() -> new NotFoundException("Customer not found: " + command.customerId()));
        User createdBy = userRepository.findById(command.createdByUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + command.createdByUserId()));
        
        ServiceRate rate = resolveRate(command.serviceType());

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
                .notes(command.notes())
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

        return order;
    }

    /**
     * Computes order pricing without creating an order.
     * Used for live price preview on the order creation form.
     *
     * @param request the preview request (weight, extra minutes, add-ons)
     * @return computed totals
     */
    @Transactional(readOnly = true)
    public OrderPreviewResponse preview(OrderPreviewRequest request) {
        ServiceRate rate = resolveRate(request.getServiceType());

        if (request.getWeightKg() == null || request.getWeightKg().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Weight must be greater than 0");
        }
        int extraMins = request.getExtraMinutes() != null ? request.getExtraMinutes() : 0;
        if (extraMins < 0) {
            throw new IllegalArgumentException("Extra minutes cannot be negative");
        }

        int totalLoads = request.getWeightKg()
                .divide(rate.getKgLimitPerLoad(), 10, RoundingMode.HALF_UP)
                .setScale(0, RoundingMode.CEILING)
                .intValue();

        BigDecimal baseAmount = rate.getBasePricePerLoad()
                .multiply(BigDecimal.valueOf(totalLoads))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal extraMinutesAmount = rate.getPricePerExtraMinute()
                .multiply(BigDecimal.valueOf(extraMins))
                .setScale(2, RoundingMode.HALF_UP);

        List<CreateOrderCommand.AddOnItem> addOnList = request.getInitialAddOns() != null
                ? request.getInitialAddOns().stream()
                        .map(a -> new CreateOrderCommand.AddOnItem(
                                a.getName(),
                                a.getPrice(),
                                a.getQuantity() > 0 ? a.getQuantity() : 1))
                        .collect(Collectors.toList())
                : List.of();

        BigDecimal addonsTotalAmount = addOnList.stream()
                .map(addOnItem -> addOnItem.price().multiply(BigDecimal.valueOf(addOnItem.quantity())).setScale(2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grandTotal = baseAmount.add(extraMinutesAmount).add(addonsTotalAmount);

        return OrderPreviewResponse.builder()
                .totalLoads(totalLoads)
                .baseAmount(baseAmount.doubleValue())
                .extraMinutesAmount(extraMinutesAmount.doubleValue())
                .addonsTotalAmount(addonsTotalAmount.doubleValue())
                .grandTotal(grandTotal.doubleValue())
                .build();
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getStats(LocalDate date) {
        Instant from = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long todaysOrders = orderRepository.count(OrderSpecification.filterBy(null, null, from, to, null, null));
        long inProgress = orderRepository.count(OrderSpecification.filterByStatusIn(
                Set.of(OrderStatus.WASHING, OrderStatus.DRYING, OrderStatus.FOLDING)));
        long readyForPickup = orderRepository.count(OrderSpecification.filterBy(OrderStatus.READY_FOR_PICKUP, null, null, null, null, null));
        long unpaidOrders = orderRepository.count(OrderSpecification.filterBy(null, PaymentStatus.UNPAID, null, null, null, null));

        BigDecimal todaysRevenue = paymentRepository.sumAmountPaidByPaymentDateBetween(from, to);

        return OrderStatsResponse.builder()
                .todaysOrders((int) todaysOrders)
                .inProgress((int) inProgress)
                .readyForPickup((int) readyForPickup)
                .unpaidOrders((int) unpaidOrders)
                .todaysRevenue(todaysRevenue)
                .build();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
        
        OrderResponse response = orderMapper.toResponse(order);
        response.setAuditLogs(auditLogService.getAuditLogForRecord("orders", id.toString()));
        return response;
    }

    @Transactional(readOnly = true)
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
    }

    /**
     * Updates extra minutes and/or add-ons for an order.
     * Allowed only when order is unpaid and not released.
     * Recalculates extraMinutesAmount, addonsTotalAmount, grandTotal using order's snapshot pricing.
     *
     * @param orderId the order ID
     * @param request update request (extraMinutes, addOns)
     * @return the updated order
     */
    @Auditable(action = "ORDER_UPDATE", description = "Update order details")
    @Transactional
    public Order update(Long orderId, UpdateOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                throw new IllegalArgumentException("Cannot update order: already paid. Only Administrators can modify completed transactions.");
            }
            if (order.getCurrentStatus() == OrderStatus.RELEASED) {
                throw new IllegalArgumentException("Cannot update order: already released. Only Administrators can modify completed transactions.");
            }
        }

        int newExtraMinutes = request.getExtraMinutes() != null ? request.getExtraMinutes() : order.getExtraMinutes();
        if (newExtraMinutes < 0) {
            throw new IllegalArgumentException("Extra minutes cannot be negative");
        }

        order.setExtraMinutes(newExtraMinutes);

        BigDecimal extraMinutesAmount = order.getPricePerExtraMinute()
                .multiply(BigDecimal.valueOf(newExtraMinutes))
                .setScale(2, RoundingMode.HALF_UP);
        order.setExtraMinutesAmount(extraMinutesAmount);

        List<CreateOrderCommand.AddOnItem> addOnList;
        if (request.getAddOns() != null) {
            addOnList = request.getAddOns().stream()
                    .map(a -> new CreateOrderCommand.AddOnItem(
                            a.getName(),
                            a.getPrice(),
                            a.getQuantity() > 0 ? a.getQuantity() : 1))
                    .collect(Collectors.toList());
            order.getAddOns().clear();
            for (CreateOrderCommand.AddOnItem item : addOnList) {
                order.getAddOns().add(OrderAddOn.builder()
                        .order(order)
                        .name(item.name())
                        .price(item.price())
                        .quantity(item.quantity())
                        .build());
            }
        } else {
            addOnList = order.getAddOns().stream()
                    .map(a -> new CreateOrderCommand.AddOnItem(
                            a.getName(),
                            a.getPrice(),
                            a.getQuantity()))
                    .collect(Collectors.toList());
        }

        BigDecimal addonsTotalAmount = addOnList.stream()
                .map(addOnItem -> addOnItem.price().multiply(BigDecimal.valueOf(addOnItem.quantity())).setScale(2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setAddonsTotalAmount(addonsTotalAmount);

        BigDecimal grandTotal = order.getBaseAmount().add(extraMinutesAmount).add(addonsTotalAmount);
        order.setGrandTotal(grandTotal);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order findByReferenceNumber(String referenceNumber) {
        return orderRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new NotFoundException("Order not found for reference: " + referenceNumber));
    }

    @Transactional(readOnly = true)
    public Page<Order> findAll(
            OrderStatus status,
            PaymentStatus paymentStatus,
            java.time.LocalDate from,
            java.time.LocalDate to,
            String q,
            Long customerId,
            Pageable pageable) {
        java.time.Instant fromTs = from != null ? from.atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null;
        java.time.Instant toTs = to != null ? to.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null;
        var spec = OrderSpecification.filterBy(status, paymentStatus, fromTs, toTs, q, customerId);
        return orderRepository.findAll(spec, pageable);
    }

    private ServiceRate resolveRate(String serviceType) {
        if (serviceType == null) return serviceRateService.getActiveRate();
        
        String dbName = switch (serviceType) {
            case "WASH_DRY_FOLD_RUSH" -> "Rush Wash";
            case "BLANKETS" -> "Blankets";
            default -> "Standard Wash";
        };
        
        return serviceRateService.getByName(dbName);
    }

    @Auditable(action = "ORDER_DELETE", description = "Delete laundry order")
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        orderRepository.delete(order);
    }

}

