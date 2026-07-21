package com.himotech.laundryms.machines.service;

import java.util.UUID;

import com.himotech.laundryms.machines.entity.Machine;
import com.himotech.laundryms.machines.entity.MachineStatus;
import com.himotech.laundryms.machines.repository.MachineRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MachineService Unit Tests")
class MachineServiceTest {

    @Mock
    private MachineRepository machineRepository;

    @InjectMocks
    private MachineService machineService;

    @Test
    @DisplayName("Should create machine successfully")
    void shouldCreateMachine() {
        when(machineRepository.count()).thenReturn(1L);
        when(machineRepository.save(any(Machine.class))).thenAnswer(i -> {
            Machine m = i.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        Machine result = machineService.createMachine("New Washer");

        assertThat(result.getName()).isEqualTo("New Washer");
        assertThat(result.getStatus()).isEqualTo(MachineStatus.OPERATIONAL);
        assertThat(result.getIsActive()).isTrue();
        verify(machineRepository).save(any(Machine.class));
    }

    @Test
    @DisplayName("Should throw exception when exceeding max limit")
    void shouldThrowExceptionWhenExceedingLimit() {
        when(machineRepository.count()).thenReturn(1L);

        assertThatThrownBy(() -> machineService.createMachine("Too Many"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Maximum limit of 50 machines reached");
    }

    @Test
    @DisplayName("Should soft delete machine")
    void shouldSoftDeleteMachine() {
        Machine machine = new Machine();
        machine.setId(UUID.randomUUID());
        machine.setIsActive(true);

        when(machineRepository.findById(UUID.randomUUID())).thenReturn(Optional.of(machine));

        machineService.deleteMachine(UUID.randomUUID());

        assertThat(machine.getIsActive()).isFalse();
        verify(machineRepository).save(machine);
    }
}
