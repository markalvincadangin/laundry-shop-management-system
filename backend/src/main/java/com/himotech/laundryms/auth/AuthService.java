package com.himotech.laundryms.auth;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.auditlog.event.AuditLogEvent;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.auth.dto.LoginResult;
import com.himotech.laundryms.auth.domain.RefreshToken;
import com.himotech.laundryms.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import java.util.Map;

/**
 * Authentication service for login and credential verification.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptService loginAttemptService;
    private final ApplicationEventPublisher eventPublisher;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Authenticates a user by username and password.
     *
     * @param username the username
     * @param password the plaintext password
     * @return the user if credentials are valid
     * @throws InvalidCredentialsException if credentials are invalid
     */
    @Auditable(action = "USER_LOGIN", description = "User login attempt")
    @Transactional
    public LoginResult authenticate(String username, String password) {
        if (loginAttemptService.isBlocked(username)) {
            throw new InvalidCredentialsException();
        }

        User user;
        try {
            user = userRepository.findByUsername(username)
                    .orElseThrow(InvalidCredentialsException::new);

            if (!user.getIsActive()) {
                throw new InvalidCredentialsException();
            }

            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new InvalidCredentialsException();
            }
        } catch (InvalidCredentialsException e) {
            loginAttemptService.loginFailed(username);
            throw e;
        }

        loginAttemptService.loginSucceeded(username);

        String accessToken = jwtService.createToken(user);
        
        // Generate secure random refresh token
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String refreshTokenPlain = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        // Hash the refresh token
        String tokenHash = hashToken(refreshTokenPlain);
        
        Instant refreshTokenExpiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .familyId(UUID.randomUUID())
                .expiresAt(refreshTokenExpiresAt)
                .build();
                
        refreshTokenRepository.save(refreshTokenEntity);

        return new LoginResult(user, accessToken, refreshTokenPlain, refreshTokenExpiresAt);
    }
    
    @Auditable(action = "USER_REFRESH", description = "User refresh token attempt")
    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public LoginResult refresh(String refreshTokenPlain) {
        String tokenHash = hashToken(refreshTokenPlain);
        RefreshToken oldToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(InvalidCredentialsException::new);

        if (oldToken.isRevoked()) {
            // Token Reuse Detected!
            refreshTokenRepository.revokeFamily(oldToken.getFamilyId());
            eventPublisher.publishEvent(AuditLogEvent.builder()
                    .userId(oldToken.getUser().getId().toString())
                    .actionType("REFRESH_TOKEN_REUSE_DETECTED")
                    .tableName("refresh_tokens")
                    .recordId(oldToken.getFamilyId().toString())
                    .newData(Map.of("familyId", oldToken.getFamilyId().toString()))
                    .status("FAILURE")
                    .description("Revoked refresh token was reused")
                    .build());
            throw new InvalidCredentialsException();
        }

        Instant now = Instant.now();
        if (oldToken.getExpiresAt().isBefore(now)) {
            throw new InvalidCredentialsException();
        }

        if (oldToken.getLastUsedAt() != null && oldToken.getLastUsedAt().plus(3, ChronoUnit.DAYS).isBefore(now)) {
            throw new InvalidCredentialsException();
        } else if (oldToken.getLastUsedAt() == null && oldToken.getIssuedAt().plus(3, ChronoUnit.DAYS).isBefore(now)) {
            throw new InvalidCredentialsException();
        }

        User user = oldToken.getUser();
        if (!user.getIsActive()) {
            throw new InvalidCredentialsException();
        }

        // Revoke the old token
        oldToken.setRevoked(true);
        oldToken.setLastUsedAt(now);

        // Create new token
        String accessToken = jwtService.createToken(user);
        
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String newRefreshTokenPlain = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String newTokenHash = hashToken(newRefreshTokenPlain);
        
        RefreshToken newToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .familyId(oldToken.getFamilyId()) // Same family
                .expiresAt(oldToken.getExpiresAt())
                .build();
                
        // The tests assert that the new token ID is set on the old token, but since UUIDs are auto-generated on save, we save newToken first.
        newToken = refreshTokenRepository.save(newToken);
        oldToken.setReplacedBy(newToken);
        refreshTokenRepository.save(oldToken);

        return new LoginResult(user, accessToken, newRefreshTokenPlain, oldToken.getExpiresAt());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    @Auditable(action = "USER_LOGOUT", description = "User logout attempt")
    @Transactional
    public void logout(String refreshTokenPlain) {
        if (refreshTokenPlain == null || refreshTokenPlain.isEmpty()) {
            return;
        }
        String tokenHash = hashToken(refreshTokenPlain);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Auditable(action = "USER_TOKENS_REVOKED", description = "Revoked all tokens for user")
    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        if (userId == null) {
            return;
        }
        refreshTokenRepository.revokeAllForUser(userId);
    }
}
