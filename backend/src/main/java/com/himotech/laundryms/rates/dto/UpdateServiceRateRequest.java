package com.himotech.laundryms.rates.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateServiceRateRequest {
    private String serviceName;

    @DecimalMin(value = "0.01", message = "basePricePerLoad must be greater than 0")
    private BigDecimal basePricePerLoad;

    @DecimalMin(value = "0.01", message = "kgLimitPerLoad must be greater than 0")
    private BigDecimal kgLimitPerLoad;

    @DecimalMin(value = "0", message = "pricePerExtraMinute must be non-negative")
    private BigDecimal pricePerExtraMinute;

    private Boolean isActive;
}
