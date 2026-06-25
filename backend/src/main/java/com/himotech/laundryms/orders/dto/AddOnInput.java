package com.himotech.laundryms.orders.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddOnInput {
    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0", inclusive = false, message = "price must be greater than 0")
    private BigDecimal price;

    private int quantity;

}
