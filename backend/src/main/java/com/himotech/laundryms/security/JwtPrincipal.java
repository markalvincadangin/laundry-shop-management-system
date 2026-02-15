package com.himotech.laundryms.security;

import com.himotech.laundryms.common.enums.UserRole;

import java.util.UUID;

/**
 * Principal representing an authenticated user from JWT claims.
 */
public record JwtPrincipal(UUID userId, String username, UserRole role) {
}
