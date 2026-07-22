package com.himotech.laundryms.orders.service;

import java.util.UUID;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.orders.dto.CreateOrderRequest;
import com.himotech.laundryms.orders.dto.OrderListParams;
import com.himotech.laundryms.orders.dto.OrderPreviewRequest;
import com.himotech.laundryms.orders.dto.UpdateOrderRequest;
import com.himotech.laundryms.orders.dto.OrderPreviewResponse;
import com.himotech.laundryms.orders.dto.OrderStatsResponse;
import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.orders.entity.OrderAddOn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.orders.repository.OrderSpecification;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.entity.AddOnCatalog;
import com.himotech.laundryms.rates.repository.AddOnCatalogRepository;
import com.himotech.laundryms.rates.service.ServiceRateService;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import com.himotech.laundryms.orders.dto.OrderResponse;
import com.himotech.laundryms.orders.mapper.OrderMapper;
import com.himotech.laundryms.auditlog.service.AuditLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
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
    private final AddOnCatalogRepository addOnCatalogRepository;


    private static final int MAX_REFERENCE_ATTEMPTS = 10;

    private String generateUniqueTrackingNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
        Random random = new Random();
        for (int attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
            int suffix = 1000 + random.nextInt(9000); // 1000-9999
            String ref = "LDR-" + datePart + "-" + suffix;
            if (!orderRepository.existsByTrackingNumber(ref)) {
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
        UUID customerId = resolveCustomerId(request);
        
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
                request.getNotes(),
                request.getIsRush() != null ? request.getIsRush() : false
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
    private UUID resolveCustomerId(CreateOrderRequest request) {
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
        List<CreateOrderCommand.AddOnItem> normalized = new java.util.ArrayList<>();
        if (request.getInitialAddOns() != null) {
            normalized.addAll(request.getInitialAddOns().stream()
                    .map(a -> new CreateOrderCommand.AddOnItem(
                            a.getName(),
                            a.getPrice(),
                            a.getQuantity() > 0 ? a.getQuantity() : 1
                    ))
                    .collect(Collectors.toList()));
        }

        if (Boolean.TRUE.equals(request.getIsRush())) {
            boolean hasRush = normalized.stream().anyMatch(a -> a.name().equalsIgnoreCase("Rush Fee"));
            if (!hasRush) {
                addOnCatalogRepository.findByNameIgnoreCase("Rush Fee").ifPresent(catalogItem -> {
                    if (catalogItem.getIsActive()) {
                        normalized.add(new CreateOrderCommand.AddOnItem(
                                catalogItem.getName(),
                                catalogItem.getDefaultPrice(),
                                1
                        ));
                    }
                });
            }
        }
        
        return normalized;
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

        List<CreateOrderCommand.AddOnItem> addOnList = new java.util.ArrayList<>(command.addOns() != null ? command.addOns() : List.of());
        if (command.isRush()) {
            boolean hasRush = addOnList.stream().anyMatch(a -> a.name().equalsIgnoreCase("Rush Fee"));
            if (!hasRush) {
                addOnCatalogRepository.findByNameIgnoreCase("Rush Fee").ifPresent(catalogItem -> {
                    if (catalogItem.getIsActive()) {
                        addOnList.add(new CreateOrderCommand.AddOnItem(
                                catalogItem.getName(),
                                catalogItem.getDefaultPrice(),
                                1
                        ));
                    }
                });
            }
        }
        BigDecimal addonsTotalAmount = addOnList.stream()
                .map(addOnItem -> addOnItem.price().multiply(BigDecimal.valueOf(addOnItem.quantity())).setScale(2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grandTotal = baseAmount.add(extraMinutesAmount).add(addonsTotalAmount);


        Order order = Order.builder()
                .trackingNumber(generateUniqueTrackingNumber())
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
                .isRush(command.isRush())
                .notes(command.notes())
                .build();

        for (CreateOrderCommand.AddOnItem item : addOnList) {
            OrderAddOn addOn = OrderAddOn.builder()
                    .order(order)
                    .name(item.name())
                    .price(item.price())
                    .quantity(item.quantity())
                    .build();
            
            addOnCatalogRepository.findByNameIgnoreCase(item.name())
                    .ifPresent(addOn::setAddOnCatalog);
                    
            order.getAddOns().add(addOn);
        }

        order = orderRepository.save(order);
        

        log.info("Order created successfully: Reference={}, Customer={} {}, Total=₱{}", 
                order.getTrackingNumber(), 
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

        List<CreateOrderCommand.AddOnItem> addOnList = new java.util.ArrayList<>();
        if (request.getInitialAddOns() != null) {
            addOnList.addAll(request.getInitialAddOns().stream()
                    .map(a -> new CreateOrderCommand.AddOnItem(
                            a.getName(),
                            a.getPrice(),
                            a.getQuantity() > 0 ? a.getQuantity() : 1))
                    .collect(Collectors.toList()));
        }

        if (Boolean.TRUE.equals(request.getIsRush())) {
            boolean hasRush = addOnList.stream().anyMatch(a -> a.name().equalsIgnoreCase("Rush Fee"));
            if (!hasRush) {
                addOnCatalogRepository.findByNameIgnoreCase("Rush Fee").ifPresent(catalogItem -> {
                    if (catalogItem.getIsActive()) {
                        addOnList.add(new CreateOrderCommand.AddOnItem(
                                catalogItem.getName(),
                                catalogItem.getDefaultPrice(),
                                1
                        ));
                    }
                });
            }
        }

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

        long todaysOrders = orderRepository.count(OrderSpecification.filterBy(null, null, from, to, null, null, null));
        long inProgress = orderRepository.count(OrderSpecification.filterByStatusIn(
                Set.of(OrderStatus.WASHING, OrderStatus.DRYING, OrderStatus.FOLDING)));
        long readyForPickup = orderRepository.count(OrderSpecification.filterBy(OrderStatus.READY_FOR_PICKUP, null, null, null, null, null, null));
        long unpaidOrders = orderRepository.count(OrderSpecification.filterBy(null, PaymentStatus.UNPAID, null, null, null, null, null));

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
    public OrderResponse getOrderDetails(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
        
        OrderResponse response = orderMapper.toResponse(order);
        response.setAuditLogs(auditLogService.getAuditLogForRecord("orders", id.toString()));
        return response;
    }

    @Transactional(readOnly = true)
    public Order findById(UUID id) {
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
    public Order update(UUID orderId, UpdateOrderRequest request) {
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

        order = orderRepository.save(order);
        
        
        return order;
    }

    @Transactional(readOnly = true)
    public Order findByTrackingNumber(String trackingNumber) {
        return orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new NotFoundException("Order not found for reference: " + trackingNumber));
    }

    @Transactional(readOnly = true)
    public Page<Order> search(OrderListParams params, Pageable pageable) {
        Instant from = params.getFrom() != null ? params.getFrom().atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant to = params.getTo() != null ? params.getTo().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        
        Specification<Order> spec = OrderSpecification.filterBy(
                params.getStatus(),
                params.getPaymentStatus(),
                from,
                to,
                params.getQ(),
                params.getCustomerId(),
                params.getServiceRateId()
        );
        return orderRepository.findAll(spec, pageable);
    }

    private ServiceRate resolveRate(String serviceType) {
        if (serviceType == null) return serviceRateService.getActiveRate();
        
        String dbName = switch (serviceType) {
            case "BLANKETS" -> "Blankets";
            default -> "Standard Wash";
        };
        
        return serviceRateService.getByName(dbName);
    }

    @Auditable(action = "ORDER_DELETE", description = "Delete laundry order")
    @Transactional
    public void deleteOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        orderRepository.delete(order);
        
    }

}

