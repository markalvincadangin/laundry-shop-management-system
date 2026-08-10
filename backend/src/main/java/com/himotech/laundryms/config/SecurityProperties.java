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
    /**
     * The public-facing customer portal URL. Written by the Windows installer
     * from the 'Remote Frontend URL' wizard input (RemoteFrontendUrl). Used
     * to generate the tracking QR code on printed order receipts.
     * Defaults to the Vercel deployment for cloud/dev environments.
     */
    private String portalUrl = "https://laundry-shop-management-system.vercel.app";
    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";
    private int bcryptStrength = 10;
}
