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
public class AuditLogResponse {
    private Long id;
    private String actor;
    private String operation;
    private String entityType;
    private String entityId;
    private String snapshot;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String methodName;
    private String description;
    private Instant createdAt;
}
