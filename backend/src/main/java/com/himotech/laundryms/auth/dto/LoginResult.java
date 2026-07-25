package com.himotech.laundryms.auth.dto;

import com.himotech.laundryms.users.entity.User;

public record LoginResult(User user, String accessToken, String refreshToken) {}
