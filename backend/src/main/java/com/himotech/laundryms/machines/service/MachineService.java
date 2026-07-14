package com.himotech.laundryms.machines.service;

import com.himotech.laundryms.machines.entity.Machine;
import com.himotech.laundryms.machines.entity.MachineStatus;
import com.himotech.laundryms.machines.repository.MachineRepository;
import com.himotech.laundryms.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineService {
    private final MachineRepository machineRepository;

    @Transactional(readOnly = true)
    public List<Machine> getAllMachines() {
        return machineRepository.findAllByIsActiveTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Machine getMachineById(final Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Machine not found: " + id));
    }

    @Transactional
    public Machine createMachine(final String name) {
        if (machineRepository.count() >= 50) {
            throw new IllegalStateException("Maximum limit of 50 machines reached");
        }
        Machine machine = Machine.builder()
                .name(name)
                .status(MachineStatus.OPERATIONAL)
                .isActive(true)
                .build();
        return machineRepository.save(machine);
    }

    @Transactional
    public Machine updateStatus(final Long id, MachineStatus status) {
        Machine machine = getMachineById(id);
        machine.setStatus(status);
        return machineRepository.save(machine);
    }

    @Transactional
    public void deleteMachine(final Long id) {
        Machine machine = getMachineById(id);
        machine.setIsActive(false);
        machineRepository.save(machine);
    }
}
