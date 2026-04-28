package com.himotech.laundryms.auditlog.event;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * Event carrying audit data to be processed asynchronously.
 */
@Getter
@Builder
public class AuditLogEvent {
    private final String userId;
    private final String actionType;
    private final String tableName;
    private final String recordId;
    private final Map<String, Object> oldData;
    private final Map<String, Object> newData;
    private final String ipAddress;
    private final String userAgent;
    private final String status;
    private final String methodName;
    private final String description;
}
