package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.orders.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Order entity.
 * Provides database access for order-related operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"statusLogs"})
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdWithStatusLogs(@Param("id") Long id);

    /**
     * Finds an order by its unique reference number.
     * Required for the public tracking endpoint (US-04) to allow customers
     * to track their order status without authentication.
     *
     * @param referenceNumber the unique order reference number
     * @return an Optional containing the order if found, empty otherwise
     */
    Optional<Order> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.currentStatus = :status) AND " +
            "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
            "(:fromTs IS NULL OR o.createdAt >= :fromTs) AND " +
            "(:toTs IS NULL OR o.createdAt < :toTs)")
    Page<Order> findAllFiltered(
            @Param("status") OrderStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("fromTs") java.time.LocalDateTime fromTs,
            @Param("toTs") java.time.LocalDateTime toTs,
            Pageable pageable);
}

