package com.himotech.laundryms.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO for a single order status log entry (status timeline).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusLogResponse {
    private String previousStatus;
    private String newStatus;
    private OffsetDateTime changedAt;
    private String notes;
}
