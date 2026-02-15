package com.himotech.laundryms.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String referenceNumber;
    private Long customerId;
    private String createdByUserId;
    private Integer serviceRateId;
    private Double weightKg;
    private Integer totalLoads;
    private Integer extraMinutes;
    private Double baseAmount;
    private Double extraMinutesAmount;
    private Double addonsTotalAmount;
    private Double grandTotal;
    private String currentStatus;
    private String paymentStatus;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}