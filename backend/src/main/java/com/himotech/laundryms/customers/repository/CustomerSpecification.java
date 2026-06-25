package com.himotech.laundryms.customers.repository;

import com.himotech.laundryms.customers.entity.Customer;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * CustomerSpecification: Provides dynamic JPA Criteria predicates for the Customer module.
 * Adheres to ARCH-001 §1.1 (Repository Responsibility) and the Specification Pattern.
 */
public class CustomerSpecification {

    /**
     * Builds a composite specification for filtering customers.
     * Supports keyword search (name, contact), activity status, and date ranges.
     */
    public static Specification<Customer> filterBy(
            String q,
            Boolean isActive,
            Instant from,
            Instant to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Activity Status Filter
            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            // 2. Date Range Filters (Forensic Traceability)
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
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(root.get("contactNumber"), pattern),
                        // Full Name Concatenation (First Last)
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))), pattern),
                        // Full Name Concatenation (Last First)
                        cb.like(cb.lower(cb.concat(cb.concat(root.get("lastName"), " "), root.get("firstName"))), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
