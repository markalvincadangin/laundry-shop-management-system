package com.himotech.laundryms.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private String trackingNumber;
    private String currentStatus;
    private String customerName;
    private String contactNumber;
    private Instant createdAt;
    private Double grandTotal;
    private String paymentStatus;
    private Double weightKg;
    private Integer totalLoads;
    private Boolean isRush;
}