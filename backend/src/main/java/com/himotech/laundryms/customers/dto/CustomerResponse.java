package com.himotech.laundryms.customers.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String contactNumber;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean isActive;
}
