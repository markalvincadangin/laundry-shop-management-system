package com.himotech.laundryms.clientalert.api;

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
    private Long id;
    private Long orderId;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private String contactNumber;
    private String message;
    private String status;
    private Instant createdAt;
    private Instant sentAt;
    private boolean isRead;
}
