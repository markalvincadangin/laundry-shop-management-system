package com.himotech.laundryms.machines.dto;

import com.himotech.laundryms.machines.entity.MachineStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class MachineResponse {
    private Long id;
    private String name;
    private MachineStatus status;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
