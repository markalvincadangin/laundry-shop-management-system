package com.himotech.laundryms.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {
    @NotBlank(message = "app.security.jwt-secret is required")
    private String jwtSecret;
    private String cookieName;
    private String allowedOrigin;
    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";
    private int bcryptStrength = 10;
}
