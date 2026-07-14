package com.himotech.laundryms.machines.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.machines.dto.CreateMachineRequest;
import com.himotech.laundryms.machines.dto.UpdateMachineStatusRequest;
import com.himotech.laundryms.machines.entity.Machine;
import com.himotech.laundryms.machines.entity.MachineStatus;
import com.himotech.laundryms.machines.mapper.MachineMapper;
import com.himotech.laundryms.machines.service.MachineService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Import;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;

@WebMvcTest(MachineController.class)
@Import({MachineControllerTest.MockSecurityConfig.class, GlobalExceptionHandler.class})
@DisplayName("MachineController Security Tests")
class MachineControllerTest {

    @org.springframework.boot.test.context.TestConfiguration
    @EnableMethodSecurity
    static class MockSecurityConfig {}

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MachineService machineService;

    @MockBean
    private MachineMapper machineMapper;

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("STAFF can view machines")
    void staffCanViewMachines() throws Exception {
        mockMvc.perform(get("/api/v1/machines"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("STAFF cannot create machine")
    void staffCannotCreateMachine() throws Exception {
        CreateMachineRequest request = new CreateMachineRequest();
        request.setName("Washer 1");

        mockMvc.perform(post("/api/v1/machines")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN can create machine")
    void adminCanCreateMachine() throws Exception {
        CreateMachineRequest request = new CreateMachineRequest();
        request.setName("Washer 1");

        Machine machine = new Machine();
        machine.setId(1L);
        machine.setName("Washer 1");
        
        when(machineService.createMachine(any())).thenReturn(machine);

        mockMvc.perform(post("/api/v1/machines")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("STAFF cannot update machine status")
    void staffCannotUpdateMachineStatus() throws Exception {
        UpdateMachineStatusRequest request = new UpdateMachineStatusRequest();
        request.setStatus(MachineStatus.MAINTENANCE);

        mockMvc.perform(patch("/api/v1/machines/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN can update machine status")
    void adminCanUpdateMachineStatus() throws Exception {
        UpdateMachineStatusRequest request = new UpdateMachineStatusRequest();
        request.setStatus(MachineStatus.MAINTENANCE);

        Machine machine = new Machine();
        machine.setId(1L);
        
        when(machineService.updateStatus(eq(1L), any())).thenReturn(machine);

        mockMvc.perform(patch("/api/v1/machines/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
