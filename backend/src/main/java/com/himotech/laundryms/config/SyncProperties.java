package com.himotech.laundryms.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@Component
@ConfigurationProperties(prefix = "app.sync")
public class SyncProperties {
    @NotBlank(message = "app.sync.cloud-api-url is required")
    private String cloudApiUrl;
    
    @NotBlank(message = "app.sync.sync-secret is required")
    private String syncSecret;
}
