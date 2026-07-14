package com.himotech.laundryms.settings.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateSystemSettingsRequest(
    @NotNull(message = "System pause status must not be null")
    Boolean isSystemPaused
) {}
