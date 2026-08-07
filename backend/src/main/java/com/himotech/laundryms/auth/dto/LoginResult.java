package com.himotech.laundryms.auth.dto;

import com.himotech.laundryms.users.entity.User;
import java.time.Instant;

public record LoginResult(User user, String accessToken, String refreshToken, Instant refreshTokenExpiresAt) {
    public LoginResult(User user, String accessToken, String refreshToken) {
        this(user, accessToken, refreshToken, null);
    }
}
