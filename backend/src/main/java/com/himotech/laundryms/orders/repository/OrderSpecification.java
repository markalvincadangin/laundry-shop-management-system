package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.orders.entity.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * JPA Specifications for Order filtering.
 * Uses dynamic predicates to avoid PostgreSQL 42P18 ("could not determine data type of parameter")
 * when optional filter parameters are null. Building predicates only for non-null values
 * prevents Hibernate from generating "? IS NULL OR column = ?" patterns that confuse PostgreSQL.
 */
public final class OrderSpecification {

    private OrderSpecification() {
    }

    public static Specification<Order> filterBy(
            OrderStatus status,
            PaymentStatus paymentStatus,
            LocalDateTime fromTs,
            LocalDateTime toTs) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("currentStatus"), status));
            }
            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }
            if (fromTs != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromTs));
            }
            if (toTs != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), toTs));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Order> filterByStatusIn(Set<OrderStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("currentStatus").in(statuses);
        };
    }
}
