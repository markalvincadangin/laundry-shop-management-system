package com.highvoltage.laundryms.api.request;

import java.math.BigDecimal;

public record CreateOrderRequest(
        Long customerId,
        Long createdByUserId,
        String orderReferenceNumber,
        String serviceType,
        BigDecimal weight,
        String specialItems,
        BigDecimal totalAmount
) {}
