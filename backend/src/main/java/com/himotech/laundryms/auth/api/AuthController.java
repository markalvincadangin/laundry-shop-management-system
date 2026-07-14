package com.himotech.laundryms.auth.api;

import com.himotech.laundryms.auth.dto.LoginRequest;
import com.himotech.laundryms.auth.dto.CurrentUserResponse;
import com.himotech.laundryms.auth.dto.LoginResponse;
import com.himotech.laundryms.auth.AuthService;
import com.himotech.laundryms.auth.JwtService;
import com.himotech.laundryms.auth.JwtPrincipal;
import com.himotech.laundryms.config.SecurityProperties;
import com.himotech.laundryms.users.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for login and current user.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final SecurityProperties securityProperties;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        User user = authService.authenticate(request.getUsername(), request.getPassword());
        String token = jwtService.createToken(user);

        String cookieName = securityProperties.getCookieName() != null
                ? securityProperties.getCookieName()
                : "access_token";

        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(securityProperties.isCookieSecure());
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 hours
        cookie.setAttribute("SameSite", securityProperties.getCookieSameSite());
        response.addCookie(cookie);

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        String cookieName = securityProperties.getCookieName() != null
                ? securityProperties.getCookieName()
                : "access_token";

        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
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
}
