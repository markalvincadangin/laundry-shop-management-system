package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Order entity.
 * Provides database access for order-related operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Finds an order by its unique reference number.
     * Required for the public tracking endpoint (US-04) to allow customers
     * to track their order status without authentication.
     *
     * @param referenceNumber the unique order reference number
     * @return an Optional containing the order if found, empty otherwise
     */
    Optional<Order> findByReferenceNumber(String referenceNumber);
}

