package com.himotech.laundryms.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponse {
    private int todaysOrders;
    private int inProgress;
    private int readyForPickup;
    private int unpaidOrders;
    private BigDecimal todaysRevenue;
}
