package com.himotech.laundryms.orders.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
        UUID customerId,
        UUID createdByUserId,
        BigDecimal weightKg,
        int extraMinutes,
        List<AddOnItem> addOns,
        String serviceType,
        String notes,
        boolean isRush,
        List<UUID> machineIds
) {
    public CreateOrderCommand(
            UUID customerId,
            UUID createdByUserId,
            BigDecimal weightKg,
            int extraMinutes,
            List<AddOnItem> addOns,
            String serviceType,
            String notes,
            boolean isRush
    ) {
        this(customerId, createdByUserId, weightKg, extraMinutes, addOns, serviceType, notes, isRush, null);
    }

    public record AddOnItem(String name, BigDecimal price, int quantity) {}
}
