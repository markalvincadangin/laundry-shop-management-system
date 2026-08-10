package com.himotech.laundryms.machines.dto;

import com.himotech.laundryms.machines.entity.MachineStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMachineRequest {
    @NotBlank(message = "Machine name is required")
    private String name;

    @NotNull(message = "Machine status is required")
    private MachineStatus status;
}
