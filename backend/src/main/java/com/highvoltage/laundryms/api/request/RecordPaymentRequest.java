package com.highvoltage.laundryms.api.request;

import java.math.BigDecimal;

public record RecordPaymentRequest(
        Long orderId,
        Long receivedByUserId,
        BigDecimal amountPaid
) {}
