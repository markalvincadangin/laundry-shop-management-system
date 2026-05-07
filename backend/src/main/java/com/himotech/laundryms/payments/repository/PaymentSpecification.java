package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.payments.entity.Payment;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * PaymentSpecification: Provides dynamic JPA Criteria predicates for the Payments module.
 * Adheres to ARCH-001 §1.1 and includes performance optimizations (Eager Joins).
 */
public class PaymentSpecification {

    /**
     * Builds a composite specification for filtering payments.
     * Supports keyword search (reference, customer), order linking, and date ranges.
     */
    public static Specification<Payment> filterBy(
            Long orderId,
            Instant from,
            Instant to,
            String q) {
        return (root, query, cb) -> {
            // Performance: Ensure Order and Customer are fetched in the same query (prevents N+1)
            if (Long.class != query.getResultType()) { // Only fetch on data queries, not count queries
                root.fetch("order", JoinType.LEFT).fetch("customer", JoinType.LEFT);
                root.fetch("receivedBy", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            // 1. Order ID Filter
            if (orderId != null) {
                predicates.add(cb.equal(root.get("order").get("id"), orderId));
            }

            // 2. Date Range Filters (Financial Auditing)
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("paymentDate"), to));
            }

            // 3. Multi-Field Keyword Search
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("order").get("referenceNumber")), pattern),
                        cb.like(cb.lower(root.get("order").get("customer").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("order").get("customer").get("lastName")), pattern),
                        cb.like(cb.lower(root.get("paymentReference")), pattern),
                        // Full Name Concatenation
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("order").get("customer").get("firstName"), " "), root.get("order").get("customer").get("lastName"))), pattern),
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("order").get("customer").get("lastName"), " "), root.get("order").get("customer").get("firstName"))), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
