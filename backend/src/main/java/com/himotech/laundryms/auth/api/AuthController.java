package com.himotech.laundryms.auth.api;

import com.himotech.laundryms.auth.dto.LoginRequest;
import com.himotech.laundryms.auth.dto.CurrentUserResponse;
import com.himotech.laundryms.auth.dto.LoginResponse;
import com.himotech.laundryms.auth.AuthService;
import com.himotech.laundryms.auth.JwtPrincipal;
import com.himotech.laundryms.config.SecurityProperties;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

/**
 * Authentication controller for login and current user.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityProperties securityProperties;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        var result = authService.authenticate(request.getUsername(), request.getPassword());
        
        String cookieName = securityProperties.getCookieName() != null
                ? securityProperties.getCookieName()
                : "refresh_token";

        addCookie(response, cookieName, result.refreshToken(), true, "/api/v1/auth",
                cookieMaxAge(result.refreshTokenExpiresAt()));

        // Generate CSRF token for the session
        String csrfTokenValue = java.util.UUID.randomUUID().toString();
        addCookie(response, "csrf_token", csrfTokenValue, false, "/",
                cookieMaxAge(result.refreshTokenExpiresAt()));

        return ResponseEntity.ok()
                .header("X-CSRF-Token", csrfTokenValue)
                .body(LoginResponse.builder()
                        .accessToken(result.accessToken())
                        .role(result.user().getRole().name())
                        .expiresIn(900)
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
            
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            var result = authService.refresh(refreshToken);
            
            String cookieName = securityProperties.getCookieName() != null
                    ? securityProperties.getCookieName()
                    : "refresh_token";

            addCookie(response, cookieName, result.refreshToken(), true, "/api/v1/auth",
                    cookieMaxAge(result.refreshTokenExpiresAt()));

            String csrfTokenValue = java.util.UUID.randomUUID().toString();
            addCookie(response, "csrf_token", csrfTokenValue, false, "/",
                    cookieMaxAge(result.refreshTokenExpiresAt()));

            return ResponseEntity.ok()
                    .header("X-CSRF-Token", csrfTokenValue)
                    .body(LoginResponse.builder()
                            .accessToken(result.accessToken())
                            .role(result.user().getRole().name())
                            .expiresIn(900)
                            .build());
        } catch (com.himotech.laundryms.auth.InvalidCredentialsException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
            
        if (refreshToken != null && !refreshToken.isEmpty()) {
            authService.logout(refreshToken);
        }
        
        String cookieName = securityProperties.getCookieName() != null
                ? securityProperties.getCookieName()
                : "refresh_token";

        addCookie(response, cookieName, "", true, "/api/v1/auth", 0);
        addCookie(response, "csrf_token", "", false, "/", 0);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(HttpServletResponse response) {
        String csrfTokenValue = java.util.UUID.randomUUID().toString();
        addCookie(response, "csrf_token", csrfTokenValue, false, "/", 7 * 24 * 60 * 60);
        return ResponseEntity.ok().header("X-CSRF-Token", csrfTokenValue).build();
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(CurrentUserResponse.builder()
                .userId(principal.userId().toString())
                .username(principal.username())
                .role(principal.role().name())
                .build());
    }

    private int cookieMaxAge(Instant expiresAt) {
        if (expiresAt == null) {
            return 7 * 24 * 60 * 60;
        }
        return (int) Math.max(0, Duration.between(Instant.now(), expiresAt).getSeconds());
    }

    private void addCookie(HttpServletResponse response, String name, String value, boolean httpOnly,
            String path, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(securityProperties.isCookieSecure())
                .sameSite(securityProperties.getCookieSameSite())
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
