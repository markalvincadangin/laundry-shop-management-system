package com.highvoltage.laundryms.payments;

import com.highvoltage.laundryms.exception.ConflictException;
import com.highvoltage.laundryms.exception.NotFoundException;
import com.highvoltage.laundryms.orders.LaundryOrder;
import com.highvoltage.laundryms.orders.LaundryOrderRepository;
import com.highvoltage.laundryms.orders.PaymentStatus;
import com.highvoltage.laundryms.users.User;
import com.highvoltage.laundryms.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final LaundryOrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            LaundryOrderRepository orderRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Payment recordPayment(Long orderId, Long receivedByUserId, BigDecimal amountPaid) {

        LaundryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (paymentRepository.existsByOrderId(orderId)) {
            throw new ConflictException("Payment already exists for order: " + orderId);
        }

        User receivedBy = userRepository.findById(receivedByUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + receivedByUserId));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setReceivedBy(receivedBy);
        payment.setAmountPaid(amountPaid);
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Update the order payment status (keep string literal safe)
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);

        return saved;
    }
}
