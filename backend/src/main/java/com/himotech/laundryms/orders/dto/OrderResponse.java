package com.himotech.laundryms.orders.dto;

import java.util.UUID;

import com.himotech.laundryms.auditlog.dto.AuditLogResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String referenceNumber;
    private UUID customerId;
    private String customerName;
    private String contactNumber;
    private String createdByUserId;
    private String createdByUsername;
    private UUID serviceRateId;
    private Double weightKg;
    private Integer totalLoads;
    private Double basePricePerLoad;
    private Double kgLimitPerLoad;
    private Integer extraMinutes;
    private Double pricePerExtraMinute;
    private Double baseAmount;
    private Double extraMinutesAmount;
    private Double addonsTotalAmount;
    private Double grandTotal;
    private String currentStatus;
    private String paymentStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private String notes;
    private Boolean isRush;
    private List<AddOnResponse> addOns;
    private List<AuditLogResponse> auditLogs;
    private List<UUID> machineIds;
}