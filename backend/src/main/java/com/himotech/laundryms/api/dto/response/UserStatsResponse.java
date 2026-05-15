package com.himotech.laundryms.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponse {
    private long totalAdmins;
    private long totalActiveStaff;
    private long totalUsers;
}
