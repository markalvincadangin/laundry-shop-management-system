package com.highvoltage.laundryms.api.response;

import com.highvoltage.laundryms.orders.OrderStatus;
import com.highvoltage.laundryms.orders.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long customerId,
        Long createdByUserId,
        String orderReferenceNumber,
        String serviceType,
        BigDecimal weight,
        String specialItems,
        BigDecimal totalAmount,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        LocalDateTime dateReceived,
        LocalDateTime dateReleased
) {}
