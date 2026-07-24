package com.himotech.laundryms.users.dto;

import com.himotech.laundryms.shared.UserRole;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private UserRole role;
    private String password; // Optional
}
