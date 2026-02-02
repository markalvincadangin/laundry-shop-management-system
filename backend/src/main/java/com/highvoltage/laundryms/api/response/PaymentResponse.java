package com.highvoltage.laundryms.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        Long receivedByUserId,
        BigDecimal amountPaid,
        LocalDateTime paymentDate
) {}
