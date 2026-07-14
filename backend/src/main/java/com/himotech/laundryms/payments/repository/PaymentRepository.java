package com.himotech.laundryms.payments.repository;

import java.util.UUID;

import com.himotech.laundryms.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Repository interface for Payment entity.
 * Provides database access for payment-related operations.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

        @Query("SELECT p.paymentMethod, COALESCE(SUM(p.amountPaid), 0) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED') GROUP BY p.paymentMethod")
        List<Object[]> sumAmountPaidByPaymentMethodBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query(value = "SELECT DATE(p.payment_date) as day, COALESCE(SUM(p.amount_paid), 0) as total, COUNT(p.id) as count "
                        +
                        "FROM payments p " +
                        "JOIN orders o ON p.order_id = o.id " +
                        "WHERE p.payment_date >= :from AND p.payment_date < :to " +
                        "AND o.payment_status NOT IN ('VOIDED', 'REFUNDED') " +
                        "GROUP BY day ORDER BY day ASC", nativeQuery = true)
        List<Object[]> getSalesTrend(@Param("from") Instant from, @Param("to") Instant to);

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
        boolean existsByOrder_Id(UUID orderId);

        Optional<Payment> findByOrder_Id(UUID orderId);

        void deleteByOrder_Id(UUID orderId);

        @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        BigDecimal sumAmountPaidByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT COUNT(p) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        long countByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);
}
