package com.himotech.laundryms.payments.repository;

import com.himotech.laundryms.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Payment entity.
 * Provides database access for payment-related operations.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Checks if a payment already exists for the given order.
     * This enforces the 'One Payment Per Order' rule (BR-PAY-02).
     *
     * Must be called before creating a new payment to prevent
     * duplicate payments for the same order.
     *
     * @param orderId the order ID to check (maps to order.id)
     * @return true if a payment exists for this order, false otherwise
     */
    boolean existsByOrder_Id(Long orderId);
}

