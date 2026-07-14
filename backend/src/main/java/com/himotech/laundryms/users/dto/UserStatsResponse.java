package com.himotech.laundryms.users.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponse {
    private long totalAdmins;
    private long totalActiveStaff;
    private long totalUsers;
}
