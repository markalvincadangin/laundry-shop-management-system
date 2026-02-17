package com.himotech.laundryms.payments.service;

import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.exception.ConflictException;
import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public Payment create(RecordPaymentCommand command) {
        Order order = orderRepository.findById(command.orderId())
                .orElseThrow(() -> new NotFoundException("Order not found: " + command.orderId()));

        User receivedBy = userRepository.findById(command.receivedByUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + command.receivedByUserId()));

        if (paymentRepository.existsByOrder_Id(command.orderId())) {
            throw new ConflictException("Payment already recorded for this order");
        }
        if (command.amountPaid().compareTo(order.getGrandTotal()) != 0) {
            throw new IllegalArgumentException(
                    "Payment amount must match order total. Expected: " + order.getGrandTotal() + ", received: " + command.amountPaid()
            );
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(order)
                .amountPaid(command.amountPaid())
                .paymentMethod(command.paymentMethod())
                .receivedBy(receivedBy)
                .paymentDate(LocalDateTime.now())
                .remarks(command.remarks())
                .build();
        payment = paymentRepository.save(payment);

        log.info("Payment recorded successfully: OrderRef={}, Amount=₱{}, Method={}", 
                order.getReferenceNumber(), 
                payment.getAmountPaid(), 
                payment.getPaymentMethod());

        return payment;
    }

    @Transactional(readOnly = true)
    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Payment> findAll(Long orderId, LocalDate from, LocalDate to, Pageable pageable) {
        LocalDateTime fromTs = from != null ? from.atStartOfDay() : null;
        LocalDateTime toTs = to != null ? to.plusDays(1).atStartOfDay() : null;
        return paymentRepository.findAllFiltered(orderId, fromTs, toTs, pageable);
    }

}
