package com.himotech.laundryms.auditlog.repository;

import com.himotech.laundryms.auditlog.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByTableNameAndRecordIdOrderByCreatedAtAsc(String tableName, String recordId);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(CAST(:q AS text) IS NULL OR :q = '' OR LOWER(a.tableName) LIKE LOWER(CONCAT('%', :q, '%')) OR a.recordId LIKE CONCAT('%', :q, '%')) AND " +
           "(CAST(:action AS text) IS NULL OR :action = '' OR a.actionType = :action) AND " +
           "(CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from) AND " +
           "(CAST(:to AS timestamp) IS NULL OR a.createdAt <= :to)")
    Page<AuditLog> search(
            @Param("q") String q,
            @Param("action") String action,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);
}
