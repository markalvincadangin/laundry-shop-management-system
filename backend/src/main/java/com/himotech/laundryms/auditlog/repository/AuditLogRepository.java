package com.himotech.laundryms.auditlog.repository;

import java.util.UUID;

import com.himotech.laundryms.auditlog.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByTableNameAndRecordIdOrderByCreatedAtAsc(String tableName, String recordId);
}
