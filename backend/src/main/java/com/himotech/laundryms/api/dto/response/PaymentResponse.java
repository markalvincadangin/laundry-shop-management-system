package com.himotech.laundryms.api.dto.response;

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
    private Long id;
    private Long orderId;
    private String orderReferenceNumber;
    private String customerName;
    private Double amountPaid;
    private String paymentMethod;
    private String receivedByUserId;
    private String receivedByUsername;
    private Instant paymentDate;
    private String remarks;
}