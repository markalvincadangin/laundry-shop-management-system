package com.himotech.laundryms.orders.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;
import java.util.Set;

@Data
public class UpdateOrderStatusRequest {
    @NotBlank(message = "newStatus is required")
    private String newStatus;

    private String notes;

    private UUID changedByUserId;

    private Set<Long> machineIds;
}
