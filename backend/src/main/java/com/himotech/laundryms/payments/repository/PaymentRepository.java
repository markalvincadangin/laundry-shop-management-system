package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.payments.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.math.BigDecimal;
import java.time.Instant;

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

        Optional<Payment> findByOrder_Id(Long orderId);

        void deleteByOrder_Id(Long orderId);

        @Query("SELECT SUM(p.amountPaid) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        BigDecimal sumAmountPaidByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT COUNT(p) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        long countByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);

        @EntityGraph(attributePaths = { "order", "order.customer", "receivedBy" })
        @Query(value = "SELECT p FROM Payment p " +
                        "WHERE (CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
                        "( CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
                        "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs)", countQuery = "SELECT COUNT(p) FROM Payment p WHERE "
                                        +
                                        "(CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
                                        "(CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
                                        "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs)")
        Page<Payment> findAllFiltered(
                        @Param("orderId") Long orderId,
                        @Param("fromTs") Instant fromTs,
                        @Param("toTs") Instant toTs,
                        Pageable pageable);
}
