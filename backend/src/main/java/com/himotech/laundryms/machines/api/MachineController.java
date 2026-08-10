package com.himotech.laundryms.machines.api;

import java.util.UUID;

import com.himotech.laundryms.machines.dto.CreateMachineRequest;
import com.himotech.laundryms.machines.dto.MachineResponse;
import com.himotech.laundryms.machines.dto.UpdateMachineRequest;
import com.himotech.laundryms.machines.dto.UpdateMachineStatusRequest;
import com.himotech.laundryms.machines.entity.Machine;
import com.himotech.laundryms.machines.mapper.MachineMapper;
import com.himotech.laundryms.machines.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.himotech.laundryms.idempotency.aspect.Idempotent;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/machines")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class MachineController {

    private final MachineService machineService;
    private final MachineMapper machineMapper;

    @GetMapping
    public ResponseEntity<List<MachineResponse>> getAll() {
        List<MachineResponse> responses = machineService.getAllMachines().stream()
                .map(machineMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Idempotent(actionType = "CREATE_RESOURCE")
    public ResponseEntity<MachineResponse> create(final @Valid @RequestBody CreateMachineRequest request) {
        Machine machine = machineService.createMachine(request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(machineMapper.toResponse(machine));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Idempotent(actionType = "UPDATE_RESOURCE")
    public ResponseEntity<MachineResponse> update(
            final @PathVariable UUID id,
            final @Valid @RequestBody UpdateMachineRequest request) {
        Machine machine = machineService.updateMachine(id, request.getName(), request.getStatus());
        return ResponseEntity.ok(machineMapper.toResponse(machine));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Idempotent(actionType = "UPDATE_RESOURCE")
    public ResponseEntity<MachineResponse> updateStatus(
            final @PathVariable UUID id,
            final @Valid @RequestBody UpdateMachineStatusRequest request) {
        Machine machine = machineService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(machineMapper.toResponse(machine));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Idempotent(actionType = "DELETE_RESOURCE")
    public ResponseEntity<Void> delete(final @PathVariable UUID id) {
        machineService.deleteMachine(id);
        return ResponseEntity.noContent().build();
    }
}
