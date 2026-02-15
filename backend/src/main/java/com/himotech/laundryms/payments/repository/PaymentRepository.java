package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.payments.entity.Payment;
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
}

