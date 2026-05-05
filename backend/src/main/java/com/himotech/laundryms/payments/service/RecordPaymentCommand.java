package com.himotech.laundryms.payments.service;

import com.himotech.laundryms.common.enums.PaymentMethod;

import java.math.BigDecimal;
import java.util.UUID;

public record RecordPaymentCommand(
        Long orderId,
        BigDecimal amountPaid,
        PaymentMethod paymentMethod,
        UUID receivedByUserId,
        String remarks,
        String paymentReference
) {}