package com.himotech.laundryms.orders.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
        Long customerId,
        UUID createdByUserId,
        BigDecimal weightKg,
        int extraMinutes,
        List<AddOnItem> addOns,
        String serviceType,
        String notes,
        boolean isRush
) {
    public record AddOnItem(String name, BigDecimal price, int quantity) {}
}
