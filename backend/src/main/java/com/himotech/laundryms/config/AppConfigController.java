package com.himotech.laundryms.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Exposes read-only application configuration to the frontend.
 * <p>
 * This endpoint is intentionally public (no authentication required) because
 * the values it returns are non-sensitive deployment metadata — specifically
 * the configured customer portal URL used for generating tracking QR codes on
 * printed order receipts.
 * <p>
 * The {@code portalUrl} is written by the Windows installer from the
 * "Remote Frontend URL" wizard input (the {@code RemoteFrontendUrl} variable
 * in installer.iss), which the shop owner sets to whichever public URL their
 * customer-facing frontend is deployed at (e.g. their Vercel URL or a custom
 * domain proxied through Ngrok).
 */
@RestController
@RequestMapping("/api/v1/app-config")
public class AppConfigController {

    private final SecurityProperties props;

    public AppConfigController(SecurityProperties props) {
        this.props = props;
    }

    /**
     * Returns public application configuration consumed by the frontend.
     *
     * <pre>
     * GET /api/v1/app-config
     * → 200 { "portalUrl": "https://laundry-shop-management-system.vercel.app" }
     * </pre>
     *
     * @return a JSON object with {@code portalUrl}
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getAppConfig() {
        String portalUrl = (props.getPortalUrl() != null && !props.getPortalUrl().isBlank())
                ? props.getPortalUrl().trim()
                : "https://laundry-shop-management-system.vercel.app";
        return ResponseEntity.ok(Map.of("portalUrl", portalUrl));
    }
}
