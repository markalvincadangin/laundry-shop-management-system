package com.himotech.laundryms.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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
    /** Status timeline from order_status_logs (chronological). */
    private List<OrderStatusLogResponse> statusLogs;
    /** Order add-ons (for edit form). */
    private List<AddOnResponse> addOns;
}