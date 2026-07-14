package com.himotech.laundryms.clientalert.repository;

import com.himotech.laundryms.clientalert.entity.ClientAlert;
import com.himotech.laundryms.clientalert.ClientAlertStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * ClientAlertSpecification: Provides dynamic JPA Criteria predicates for the Messaging module.
 * Adheres to ARCH-001 §1.1 and includes performance optimizations (Eager Joins).
 */
public class ClientAlertSpecification {

    /**
     * Builds a composite specification for filtering client alerts.
     * Supports keyword search (message, reference, customer), status, and date ranges.
     */
    public static Specification<ClientAlert> filterBy(
            String q,
            ClientAlertStatus status,
            Instant from,
            Instant to) {
        return (root, query, cb) -> {
            // Performance: Eager fetch order and customer to prevent N+1 selection problems
            if (Long.class != query.getResultType()) {
                root.fetch("order", JoinType.LEFT).fetch("customer", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            // 1. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 2. Date Range Filters
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
                        cb.like(cb.lower(root.get("message")), pattern),
                        cb.like(cb.lower(root.get("order").get("referenceNumber")), pattern),
                        cb.like(cb.lower(root.get("order").get("customer").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("order").get("customer").get("lastName")), pattern),
                        // Full Name Concatenation
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("order").get("customer").get("firstName"), " "), root.get("order").get("customer").get("lastName"))), pattern),
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("order").get("customer").get("lastName"), " "), root.get("order").get("customer").get("firstName"))), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
