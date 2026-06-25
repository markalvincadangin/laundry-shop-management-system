package com.himotech.laundryms.auditlog.event;

import com.himotech.laundryms.auditlog.entity.AuditLog;
import com.himotech.laundryms.auditlog.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @Async
    @EventListener
    public void handleAuditLogEvent(AuditLogEvent event) {
        log.debug("Processing audit event: {} by user {}", event.getActionType(), event.getUserId());
        
        AuditLog logEntry = AuditLog.builder()
                .userId(event.getUserId())
                .actionType(event.getActionType())
                .tableName(event.getTableName())
                .recordId(event.getRecordId())
                .oldData(event.getOldData())
                .newData(event.getNewData())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .status(event.getStatus())
                .methodName(event.getMethodName())
                .description(event.getDescription())
                .build();

        try {
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }
}
