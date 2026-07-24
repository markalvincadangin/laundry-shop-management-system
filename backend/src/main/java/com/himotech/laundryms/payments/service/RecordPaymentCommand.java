package com.himotech.laundryms.payments.service;

import com.himotech.laundryms.payments.PaymentMethod;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Command for recording a payment transaction.
 */
public record RecordPaymentCommand(
        UUID orderId,
        BigDecimal amountPaid,
        PaymentMethod paymentMethod,
        UUID receivedByUserId,
        String remarks,
        String paymentReference
) {}