package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Order entity.
 * Provides database access for order-related operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);
}
