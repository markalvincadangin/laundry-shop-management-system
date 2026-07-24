package com.himotech.laundryms.rates.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAddOnCatalogRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Default price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Default price cannot be negative")
    private BigDecimal defaultPrice;
}
