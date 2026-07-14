package com.himotech.laundryms.settings.service;

import com.himotech.laundryms.settings.dto.SystemSettingsResponse;
import com.himotech.laundryms.settings.dto.UpdateSystemSettingsRequest;
import com.himotech.laundryms.settings.entity.SystemSettings;
import com.himotech.laundryms.settings.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingsRepository systemSettingsRepository;

    @Transactional(readOnly = true)
    public SystemSettingsResponse getSettings() {
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseGet(() -> new SystemSettings(1L, false, null));
        return new SystemSettingsResponse(settings.isSystemPaused());
    }

    @Transactional
    @com.himotech.laundryms.auditlog.aspect.Auditable(action = "SYSTEM_PAUSE", description = "Updated system pause status")
    public SystemSettingsResponse updateSettings(final UpdateSystemSettingsRequest request) {
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElse(new SystemSettings(1L, false, null));
        
        settings.setSystemPaused(request.isSystemPaused());
        settings = systemSettingsRepository.save(settings);
        
        return new SystemSettingsResponse(settings.isSystemPaused());
    }
}
