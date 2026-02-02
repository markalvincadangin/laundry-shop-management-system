package com.highvoltage.laundryms.orders;

import com.highvoltage.laundryms.customers.Customer;
import com.highvoltage.laundryms.customers.CustomerRepository;
import com.highvoltage.laundryms.exception.ConflictException;
import com.highvoltage.laundryms.exception.NotFoundException;
import com.highvoltage.laundryms.users.User;
import com.highvoltage.laundryms.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class OrderService {

    private final LaundryOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public OrderService(
            LaundryOrderRepository orderRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LaundryOrder createOrder(
            Long customerId,
            Long createdByUserId,
            String orderReferenceNumber,
            String serviceType,
            BigDecimal weight,
            String specialItems,
            BigDecimal totalAmount
    ) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));

        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + createdByUserId));

        if (orderRepository.existsByOrderReferenceNumber(orderReferenceNumber)) {
            throw new ConflictException("Order reference number already exists: " + orderReferenceNumber);
        }

        LaundryOrder order = new LaundryOrder();
        order.setCustomer(customer);
        order.setCreatedBy(createdBy);
        order.setOrderReferenceNumber(orderReferenceNumber);
        order.setServiceType(serviceType);
        order.setWeight(weight);
        order.setSpecialItems(specialItems);
        order.setTotalAmount(totalAmount);

        // Defaults for Phase 5 (string constants)
        order.setOrderStatus(OrderStatus.RECEIVED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setDateReceived(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Transactional
    public LaundryOrder markReleased(Long orderId) {
        LaundryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (PaymentStatus.UNPAID.equals(order.getPaymentStatus())) {
            throw new ConflictException("Order cannot be released unless payment status is PAID.");
        }

        order.setOrderStatus(OrderStatus.RELEASED);
        order.setDateReleased(LocalDateTime.now());

        return orderRepository.save(order);
    }
}
