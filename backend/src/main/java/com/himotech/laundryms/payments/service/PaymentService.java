package com.himotech.laundryms.payments.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
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

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Auditable(action = "PAYMENT_RECORD", description = "Record payment for order")
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
                .paymentDate(Instant.now())
                .remarks(command.remarks())
                .build();
        payment = paymentRepository.save(payment);

        log.info("Payment recorded successfully: OrderRef={}, Amount=₱{}, Method={}", 
                order.getReferenceNumber(), 
                payment.getAmountPaid(), 
                payment.getPaymentMethod());

        return payment;
    }
    @Auditable(action = "PAYMENT_VOID", description = "Void existing payment")
    @Transactional
    public void voidPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (!paymentRepository.existsByOrder_Id(orderId)) {
            throw new NotFoundException("No payment found for this order to void");
        }

        // BR-PAY-06: Set status to VOIDED
        order.setPaymentStatus(PaymentStatus.VOIDED);
        orderRepository.save(order);

        // To allow re-payment in MVP (due to 1-to-1 unique constraint), we delete the failed record.
        // The Audit Log aspect will capture this deletion for the audit trail.
        paymentRepository.deleteByOrder_Id(orderId);

        log.info("Payment voided successfully: OrderRef={}", order.getReferenceNumber());
    }

    @Transactional(readOnly = true)
    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Payment> findAll(Long orderId, LocalDate from, LocalDate to, Pageable pageable) {
        Instant fromTs = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toTs = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return paymentRepository.findAllFiltered(orderId, fromTs, toTs, pageable);
    }

}
