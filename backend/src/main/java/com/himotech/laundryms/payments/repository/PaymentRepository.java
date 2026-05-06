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
import java.util.List;

/**
 * Repository interface for Payment entity.
 * Provides database access for payment-related operations.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

        @Query("SELECT p.paymentMethod, COALESCE(SUM(p.amountPaid), 0) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED') GROUP BY p.paymentMethod")
        List<Object[]> sumAmountPaidByPaymentMethodBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query(value = "SELECT DATE(p.payment_date) as day, COALESCE(SUM(p.amount_paid), 0) as total, COUNT(p.id) as count " +
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
        boolean existsByOrder_Id(Long orderId);

        Optional<Payment> findByOrder_Id(Long orderId);

        void deleteByOrder_Id(Long orderId);

        @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        BigDecimal sumAmountPaidByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT COUNT(p) FROM Payment p JOIN p.order o WHERE p.paymentDate >= :from AND p.paymentDate < :to AND o.paymentStatus NOT IN ('VOIDED', 'REFUNDED')")
        long countByPaymentDateBetween(@Param("from") Instant from, @Param("to") Instant to);

        @EntityGraph(attributePaths = { "order", "order.customer", "receivedBy" })
        @Query(value = "SELECT p FROM Payment p " +
                        "WHERE (CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
                        "( CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
                        "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs) AND " +
                        "(:searchTerm IS NULL OR :searchTerm = '' OR " +
                        "LOWER(p.order.referenceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.order.customer.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.order.customer.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :searchTerm, '%')))", 
                        countQuery = "SELECT COUNT(p) FROM Payment p WHERE " +
                                        "(CAST(:orderId AS long) IS NULL OR p.order.id = :orderId) AND " +
                                        "(CAST(:fromTs AS timestamp) IS NULL OR p.paymentDate >= :fromTs) AND " +
                                        "(CAST(:toTs AS timestamp) IS NULL OR p.paymentDate < :toTs) AND " +
                                        "(:searchTerm IS NULL OR :searchTerm = '' OR " +
                                        "LOWER(p.order.referenceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                                        "LOWER(p.order.customer.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                                        "LOWER(p.order.customer.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                                        "LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        Page<Payment> findAllFiltered(
                        @Param("orderId") Long orderId,
                        @Param("fromTs") Instant fromTs,
                        @Param("toTs") Instant toTs,
                        @Param("searchTerm") String searchTerm,
                        Pageable pageable);
}
