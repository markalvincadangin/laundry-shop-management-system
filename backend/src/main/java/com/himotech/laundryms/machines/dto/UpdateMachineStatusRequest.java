package com.himotech.laundryms.machines.dto;

import com.himotech.laundryms.machines.entity.MachineStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMachineStatusRequest {
    @NotNull(message = "Status is required")
    private MachineStatus status;
}
