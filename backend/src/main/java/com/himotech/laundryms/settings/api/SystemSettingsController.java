package com.himotech.laundryms.settings.api;

import com.himotech.laundryms.settings.dto.SystemSettingsResponse;
import com.himotech.laundryms.settings.dto.UpdateSystemSettingsRequest;
import com.himotech.laundryms.settings.service.SystemSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<SystemSettingsResponse> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PatchMapping("/pause")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettingsResponse> updateSettings(
            final @Valid @RequestBody UpdateSystemSettingsRequest request) {
        return ResponseEntity.ok(systemSettingsService.updateSettings(request));
    }
}
