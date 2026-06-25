package com.himotech.laundryms.auditlog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

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
    private Map<String, Object> oldState;
    private Map<String, Object> newState;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String methodName;
    private String description;
    private Instant createdAt;
}
