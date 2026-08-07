package com.himotech.laundryms.auth.api;

import com.himotech.laundryms.auth.dto.LoginRequest;
import com.himotech.laundryms.auth.dto.CurrentUserResponse;
import com.himotech.laundryms.auth.dto.LoginResponse;
import com.himotech.laundryms.auth.AuthService;
import com.himotech.laundryms.auth.JwtPrincipal;
import com.himotech.laundryms.config.SecurityProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

        Cookie cookie = new Cookie(cookieName, result.refreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(securityProperties.isCookieSecure());
        cookie.setPath("/api/v1/auth"); // Restrict path to auth endpoints
        cookie.setMaxAge(cookieMaxAge(result.refreshTokenExpiresAt()));
        cookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
        response.addCookie(cookie);

        // Generate CSRF token for the session
        String csrfTokenValue = java.util.UUID.randomUUID().toString();
        Cookie csrfCookie = new Cookie("csrf_token", csrfTokenValue);
        csrfCookie.setHttpOnly(false); // Must be readable by frontend JavaScript
        csrfCookie.setSecure(securityProperties.isCookieSecure());
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(cookieMaxAge(result.refreshTokenExpiresAt()));
        csrfCookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
        response.addCookie(csrfCookie);

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

            Cookie cookie = new Cookie(cookieName, result.refreshToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(securityProperties.isCookieSecure());
            cookie.setPath("/api/v1/auth");
            cookie.setMaxAge(cookieMaxAge(result.refreshTokenExpiresAt()));
            cookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
            response.addCookie(cookie);

            String csrfTokenValue = java.util.UUID.randomUUID().toString();
            Cookie csrfCookie = new Cookie("csrf_token", csrfTokenValue);
            csrfCookie.setHttpOnly(false);
            csrfCookie.setSecure(securityProperties.isCookieSecure());
            csrfCookie.setPath("/");
            csrfCookie.setMaxAge(cookieMaxAge(result.refreshTokenExpiresAt()));
            csrfCookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
            response.addCookie(csrfCookie);

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

        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        Cookie csrfCookie = new Cookie("csrf_token", "");
        csrfCookie.setHttpOnly(false);
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(0);
        response.addCookie(csrfCookie);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(HttpServletResponse response) {
        String csrfTokenValue = java.util.UUID.randomUUID().toString();
        Cookie csrfCookie = new Cookie("csrf_token", csrfTokenValue);
        csrfCookie.setHttpOnly(false);
        csrfCookie.setSecure(securityProperties.isCookieSecure());
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(7 * 24 * 60 * 60);
        csrfCookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
        response.addCookie(csrfCookie);
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
}
