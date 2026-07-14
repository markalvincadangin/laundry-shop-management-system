package com.himotech.laundryms.settings.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.auth.JwtService;
import com.himotech.laundryms.settings.dto.SystemSettingsResponse;
import com.himotech.laundryms.settings.dto.UpdateSystemSettingsRequest;
import com.himotech.laundryms.settings.service.SystemSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SystemSettingsController.class)
@AutoConfigureMockMvc(addFilters = false)
class SystemSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SystemSettingsService systemSettingsService;

    @MockBean
    private JwtService jwtService;

    @Test
    void getSettingsReturnscurrentsettings() throws Exception {
        SystemSettingsResponse response = new SystemSettingsResponse(true);
        when(systemSettingsService.getSettings()).thenReturn(response);

        mockMvc.perform(get("/api/v1/settings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSystemPaused").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateSettingsAsadminUpdatessuccessfully() throws Exception {
        UpdateSystemSettingsRequest request = new UpdateSystemSettingsRequest(true);
        SystemSettingsResponse response = new SystemSettingsResponse(true);

        when(systemSettingsService.updateSettings(any(UpdateSystemSettingsRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/settings/pause")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSystemPaused").value(true));
    }
}
