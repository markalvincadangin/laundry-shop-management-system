package com.himotech.laundryms.orders.dto;

import java.util.UUID;

import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import java.time.LocalDate;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * Encapsulates parameters for listing orders to avoid Checkstyle ParameterNumber warnings.
 */
@Data
public final class OrderListParams {

    /**
     * Filter by status.
     */
    private OrderStatus status;

    /**
     * Filter by payment status.
     */
    private PaymentStatus paymentStatus;

    /**
     * Filter from date.
     */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    /**
     * Filter to date.
     */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    /**
     * Search query.
     */
    private String q;

    /**
     * Page number.
     */
    private int page = 0;

    /**
     * Page size.
     */
    private int size = 20;

    /**
     * Sort by field.
     */
    private String sortBy = "createdAt";

    /**
     * Filter by customer ID.
     */
    private UUID customerId;

    /**
     * Sort direction.
     */
    private String sortDir = "desc";

    /**
     * Filter by service rate ID.
     */
    private UUID serviceRateId;
}
