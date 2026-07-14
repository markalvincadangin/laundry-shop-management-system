package com.himotech.laundryms.orders.repository;

import java.util.UUID;

import com.himotech.laundryms.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.himotech.laundryms.orders.OrderStatus;

/**
 * Repository interface for Order entity.
 * Provides database access for order-related operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.assignedMachines m WHERE m.id IN :machineIds AND o.currentStatus IN :statuses AND o.id != :orderId")
    long countConflictingMachines(@Param("machineIds") Set<Long> machineIds, @Param("statuses") List<OrderStatus> statuses, @Param("orderId") UUID orderId);
}
