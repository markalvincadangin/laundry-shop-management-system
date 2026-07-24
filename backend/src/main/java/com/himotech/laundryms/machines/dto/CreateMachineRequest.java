package com.himotech.laundryms.machines.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMachineRequest {
    @NotBlank(message = "Machine name is required")
    private String name;
}
