package com.himotech.laundryms.rates.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRateResponse {
    private UUID id;
    private String serviceName;
    private Double basePricePerLoad;
    private Double kgLimitPerLoad;
    private Double pricePerExtraMinute;
    private Boolean isActive;
}