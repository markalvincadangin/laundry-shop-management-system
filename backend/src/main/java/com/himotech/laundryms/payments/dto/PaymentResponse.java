package com.himotech.laundryms.payments.dto;

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
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private String orderTrackingNumber;
    private String customerName;
    private Double amountPaid;
    private String paymentMethod;
    private String receivedByUserId;
    private String receivedByUsername;
    private Instant paymentDate;
    private String remarks;
    private String paymentReference;
}