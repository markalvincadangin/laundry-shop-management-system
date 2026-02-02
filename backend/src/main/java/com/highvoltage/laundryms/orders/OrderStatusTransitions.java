package com.highvoltage.laundryms.orders;

import lombok.NoArgsConstructor;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static com.highvoltage.laundryms.orders.OrderStatus.*;

@NoArgsConstructor
public class OrderStatusTransitions {
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = new EnumMap<>(OrderStatus.class);

    static {
        ALLOWED.put(RECEIVED, EnumSet.of(PROCESSING));
        ALLOWED.put(PROCESSING, EnumSet.of(READY));
        ALLOWED.put(READY, EnumSet.of(RELEASED));
        ALLOWED.put(RELEASED, EnumSet.noneOf(OrderStatus.class));
    }

    public static boolean canMove(OrderStatus from, OrderStatus to) {
        return ALLOWED.getOrDefault(from, EnumSet.noneOf(OrderStatus.class)).contains(to);
    }
}
