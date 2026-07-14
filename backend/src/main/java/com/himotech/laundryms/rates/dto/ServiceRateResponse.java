package com.himotech.laundryms.rates.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRateResponse {
    private Integer id;
    private String serviceName;
    private Double basePricePerLoad;
    private Double kgLimitPerLoad;
    private Double pricePerExtraMinute;
    private Boolean isActive;
}