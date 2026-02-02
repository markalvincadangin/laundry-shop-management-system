package com.highvoltage.laundryms.orders;

import com.highvoltage.laundryms.customers.Customer;
import com.highvoltage.laundryms.customers.CustomerRepository;
import com.highvoltage.laundryms.payments.Payment;
import com.highvoltage.laundryms.payments.PaymentRepository;
import com.highvoltage.laundryms.support.AbstractPostgresIT;
import com.highvoltage.laundryms.users.Role;
import com.highvoltage.laundryms.users.User;
import com.highvoltage.laundryms.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class OrderPaymentMappingIT extends AbstractPostgresIT {

    @Autowired CustomerRepository customerRepository;
    @Autowired UserRepository userRepository;
    @Autowired LaundryOrderRepository orderRepository;
    @Autowired PaymentRepository paymentRepository;

    @Test
    void can_persist_order_and_payment_and_enforce_one_payment_per_order() {
        Customer c = customerRepository.save(new Customer(null, "Juan", "Dela Cruz", "09171234567"));
        User staff = userRepository.save(new User(null, "Staff", "One", "staff_one", "hash", Role.STAFF));

        LaundryOrder order = new LaundryOrder();
        order.setCustomer(c);
        order.setCreatedBy(staff);
        order.setOrderReferenceNumber("REF-0001");
        order.setServiceType("WASH"); // string for now
        order.setWeight(new BigDecimal("3.50"));
        order.setSpecialItems("none");
        order.setTotalAmount(new BigDecimal("150.00"));
        order.setOrderStatus(OrderStatus.RECEIVED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setDateReceived(LocalDateTime.now());

        order = orderRepository.save(order);

        Payment p1 = new Payment();
        p1.setOrder(order);
        p1.setReceivedBy(staff);
        p1.setAmountPaid(new BigDecimal("150.00"));
        p1.setPaymentDate(LocalDateTime.now());
        paymentRepository.saveAndFlush(p1);

        var foundPayment = paymentRepository.findByOrderId(order.getId());
        assertThat(foundPayment).isPresent();
        
        Payment savedPayment = foundPayment.get();
        assertThat(savedPayment.getAmountPaid()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(savedPayment.getOrder().getId()).isEqualTo(order.getId());
        assertThat(savedPayment.getReceivedBy().getId()).isEqualTo(staff.getId());

        Payment p2 = new Payment();
        p2.setOrder(order);
        p2.setReceivedBy(staff);
        p2.setAmountPaid(new BigDecimal("10.00"));
        p2.setPaymentDate(LocalDateTime.now());

        assertThatThrownBy(() -> paymentRepository.saveAndFlush(p2))
                .isInstanceOf(Exception.class); // unique(order_id) should fail
    }

    @Test
    void order_reference_number_must_be_unique() {
        Customer c = customerRepository.save(new Customer(null, "Ana", "Reyes", "09170000000"));
        User staff = userRepository.save(new User(null, "Staff", "Two", "staff_two", "hash", Role.STAFF));

        LaundryOrder o1 = new LaundryOrder();
        o1.setCustomer(c);
        o1.setCreatedBy(staff);
        o1.setOrderReferenceNumber("REF-DUP");
        o1.setServiceType("WASH");
        o1.setWeight(new BigDecimal("1.00"));
        o1.setTotalAmount(new BigDecimal("50.00"));
        o1.setOrderStatus(OrderStatus.RECEIVED);
        o1.setPaymentStatus(PaymentStatus.UNPAID);
        o1.setDateReceived(LocalDateTime.now());
        orderRepository.saveAndFlush(o1);

        LaundryOrder o2 = new LaundryOrder();
        o2.setCustomer(c);
        o2.setCreatedBy(staff);
        o2.setOrderReferenceNumber("REF-DUP");
        o2.setServiceType("WASH");
        o2.setWeight(new BigDecimal("2.00"));
        o2.setTotalAmount(new BigDecimal("100.00"));
        o2.setOrderStatus(OrderStatus.RECEIVED);
        o2.setPaymentStatus(PaymentStatus.UNPAID);
        o2.setDateReceived(LocalDateTime.now());

        assertThatThrownBy(() -> orderRepository.saveAndFlush(o2))
                .isInstanceOf(Exception.class);
    }
}
