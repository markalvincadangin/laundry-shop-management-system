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
public class OrderTrackingResponse {
    private String referenceNumber;
    private String currentStatus;
    private String customerName;
    private String contactNumber;
    private OffsetDateTime createdAt;
    private Double grandTotal;
    private String paymentStatus;
}