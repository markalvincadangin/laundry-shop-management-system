package com.himotech.laundryms.machines.mapper;

import com.himotech.laundryms.machines.dto.MachineResponse;
import com.himotech.laundryms.machines.entity.Machine;
import org.springframework.stereotype.Component;

@Component
public class MachineMapper {
    public final MachineResponse toResponse(final Machine machine) {
        if (machine == null) { return null; }
        return MachineResponse.builder()
                .id(machine.getId())
                .name(machine.getName())
                .status(machine.getStatus())
                .isActive(machine.getIsActive())
                .createdAt(machine.getCreatedAt())
                .updatedAt(machine.getUpdatedAt())
                .build();
    }
}
