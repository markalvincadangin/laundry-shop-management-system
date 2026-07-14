package com.himotech.laundryms.rates.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateServiceRateRequest {
    @NotBlank(message = "serviceName is required")
    private String serviceName;

    @NotNull(message = "basePricePerLoad is required")
    @DecimalMin(value = "0.01", message = "basePricePerLoad must be greater than 0")
    private BigDecimal basePricePerLoad;

    @NotNull(message = "kgLimitPerLoad is required")
    @DecimalMin(value = "0.01", message = "kgLimitPerLoad must be greater than 0")
    private BigDecimal kgLimitPerLoad;

    @NotNull(message = "pricePerExtraMinute is required")
    @DecimalMin(value = "0", message = "pricePerExtraMinute must be non-negative")
    private BigDecimal pricePerExtraMinute;

    private Boolean isActive = true;
}
