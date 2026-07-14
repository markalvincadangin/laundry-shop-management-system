package com.himotech.laundryms.users.dto;

import com.himotech.laundryms.shared.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private UserRole role;
    private String firstName;
    private String lastName;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
