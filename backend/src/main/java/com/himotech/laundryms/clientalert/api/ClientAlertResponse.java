package com.himotech.laundryms.clientalert.api;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientAlertResponse {
    private UUID id;
    private UUID orderId;
    private String trackingNumber;
    private UUID customerId;
    private String customerName;
    private String contactNumber;
    private String message;
    private String status;
    private Instant createdAt;
    private Instant sentAt;
    private boolean isRead;
}
