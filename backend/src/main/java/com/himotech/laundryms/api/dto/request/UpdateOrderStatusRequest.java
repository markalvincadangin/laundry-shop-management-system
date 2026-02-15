package com.himotech.laundryms.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateOrderStatusRequest {
    @NotBlank(message = "newStatus is required")
    private String newStatus;

    private String notes;

    @NotNull(message = "changedByUserId is required until auth (Phase 9)")
    private UUID changedByUserId;
}
