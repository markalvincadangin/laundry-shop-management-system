package com.himotech.laundryms.auth;

import com.himotech.laundryms.shared.UserRole;

import java.util.UUID;

/**
 * Principal representing an authenticated user from JWT claims.
 */
public record JwtPrincipal(UUID userId, String username, UserRole role) {
}
