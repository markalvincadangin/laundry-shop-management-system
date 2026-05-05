package com.himotech.laundryms.api.dto.request;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
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
     * Sort direction.
     */
    private String sortDir = "desc";
}
