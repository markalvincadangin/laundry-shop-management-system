package com.himotech.laundryms.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {
    private Long customerId;
    private CreateCustomerRequest customer;

    private UUID createdByUserId;

    @NotNull(message = "weightKg is required")
    @DecimalMin(value = "0.01", message = "weightKg must be greater than 0")
    private BigDecimal weightKg;

    @Min(0)
    private Integer extraMinutes = 0;

    @Valid
    private List<AddOnInput> initialAddOns;
}
