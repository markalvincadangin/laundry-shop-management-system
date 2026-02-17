package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.payments.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Repository interface for Payment entity.
 * Provides database access for payment-related operations.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Checks if a payment already exists for the given order.
     * This enforces the 'One Payment Per Order' rule (BR-PAY-02).
     * <p>
     * Must be called before creating a new payment to prevent
     * duplicate payments for the same order.
     *
     * @param orderId the order ID to check (maps to order.id)
     * @return true if a payment exists for this order, false otherwise
     */
    boolean existsByOrder_Id(Long orderId);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.paymentDate >= :from AND p.paymentDate < :to")
    BigDecimal sumAmountPaidByPaymentDateBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentDate >= :from AND p.paymentDate < :to")
    long countByPaymentDateBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @EntityGraph(attributePaths = {"order", "order.customer", "receivedBy"})
    @Query(value = "SELECT p FROM Payment p " +
            "WHERE (CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
            "( CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
            "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs)",
            countQuery = "SELECT COUNT(p) FROM Payment p WHERE " +
            "(CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
            "(CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
            "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs)")
    Page<Payment> findAllFiltered(
            @Param("orderId") Long orderId,
            @Param("fromTs") LocalDateTime fromTs,
            @Param("toTs") LocalDateTime toTs,
            Pageable pageable);
}

