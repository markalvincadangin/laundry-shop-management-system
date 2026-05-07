package com.himotech.laundryms.users.repository;

import com.himotech.laundryms.users.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * UserSpecification: Provides dynamic JPA Criteria predicates for the Staff Management module.
 * Adheres to ARCH-001 §1.1 and the Specification Pattern.
 */
public class UserSpecification {

    /**
     * Builds a composite specification for searching staff members.
     * Supports multi-field keyword search across username and real names.
     */
    public static Specification<User> filterBy(String q) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
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
