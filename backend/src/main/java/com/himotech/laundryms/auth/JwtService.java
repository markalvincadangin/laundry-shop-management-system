package com.himotech.laundryms.auth;

import com.himotech.laundryms.shared.UserRole;
import com.himotech.laundryms.config.SecurityProperties;
import com.himotech.laundryms.users.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Service for JWT token generation and validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final long EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

    private final SecurityProperties props;

    private SecretKey getSigningKey() {
        String secret = props.getJwtSecret();
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters (app.security.jwt-secret)");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim(CLAIM_ROLE, user.getRole().name())
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates the token and returns the claims, or null if invalid.
     */
    public Claims validateAndGetClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .clockSkewSeconds(60) // 60 seconds leeway for clock skew
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return null;
        }
    }

    public UUID getUserIdFromClaims(Claims claims) {
        String subject = claims.getSubject();
        return subject != null ? UUID.fromString(subject) : null;
    }

    public UserRole getRoleFromClaims(Claims claims) {
        String role = claims.get(CLAIM_ROLE, String.class);
        return role != null ? UserRole.valueOf(role) : null;
    }
}
