package com.himotech.laundryms.api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "orderId is required")
    private Long orderId;

    @NotNull(message = "amountPaid is required")
    @DecimalMin(value = "0", inclusive = false, message = "amountPaid must be greater than 0")
    private BigDecimal amountPaid;

    private String paymentMethod = "CASH";

    @NotNull(message = "receivedByUserId is required")
    private UUID receivedByUserId;
}
