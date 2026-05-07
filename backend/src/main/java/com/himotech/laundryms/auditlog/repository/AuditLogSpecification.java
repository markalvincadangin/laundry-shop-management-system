package com.himotech.laundryms.auditlog.repository;

import com.himotech.laundryms.auditlog.entity.AuditLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * AuditLogSpecification: Provides dynamic JPA Criteria predicates for the System Audit module.
 * Adheres to ARCH-001 §1.1 and the Specification Pattern.
 */
public class AuditLogSpecification {

    /**
     * Builds a composite specification for filtering forensic logs.
     * Supports keyword search (table, description, user), operation types, and date ranges.
     */
    public static Specification<AuditLog> filterBy(
            String q,
            String action,
            Instant from,
            Instant to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Operation/Action Filter
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("actionType"), action));
            }

            // 2. Date Range Filters (Forensic Reconstruction)
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }

            // 3. Multi-Field Keyword Search
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tableName")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("userId")), pattern),
                        cb.like(cb.lower(root.get("actionType")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
