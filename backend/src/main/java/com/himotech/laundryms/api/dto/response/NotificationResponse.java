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
public class NotificationResponse {
    private Long id;
    private Long orderId;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private String contactNumber;
    private String message;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime sentAt;
}
