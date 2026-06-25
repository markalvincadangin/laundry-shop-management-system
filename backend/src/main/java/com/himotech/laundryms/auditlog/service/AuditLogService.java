package com.himotech.laundryms.auditlog.service;

import com.himotech.laundryms.auditlog.entity.AuditLog;
import com.himotech.laundryms.auditlog.repository.AuditLogRepository;
import com.himotech.laundryms.auditlog.dto.AuditLogResponse;
import com.himotech.laundryms.config.CacheConfig;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> search(String q, String action, Instant from, Instant to, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<AuditLog> spec = 
            com.himotech.laundryms.auditlog.repository.AuditLogSpecification.filterBy(
                q, 
                action, 
                from, 
                to
            );
            
        Page<AuditLog> logs = auditLogRepository.findAll(spec, pageable);
        return logs.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAllAuditLogs(Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);
        return logs.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogForRecord(String tableName, String recordId) {
        List<AuditLog> logs = auditLogRepository.findByTableNameAndRecordIdOrderByCreatedAtAsc(tableName, recordId);
        return logs.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        String username = "System";
        if (log.getUserId() != null) {
            username = getUsername(log.getUserId());
        }

        return AuditLogResponse.builder()
                .id(log.getId())
                .actor(username)
                .operation(log.getActionType())
                .entityType(log.getTableName())
                .entityId(log.getRecordId())
                .oldState(log.getOldData())
                .newState(log.getNewData())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .status(log.getStatus())
                .methodName(log.getMethodName())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }

    @Cacheable(value = CacheConfig.CACHE_USERNAMES, key = "#userId", unless = "#result == 'Unknown'")
    public String getUsername(String userId) {
        try {
            return userRepository.findById(UUID.fromString(userId))
                    .map(User::getUsername)
                    .orElse("Unknown");
        } catch (Exception e) {
            return "Unknown";
        }
    }
}
