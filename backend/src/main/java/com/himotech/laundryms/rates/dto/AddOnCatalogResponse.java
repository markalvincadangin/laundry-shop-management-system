package com.himotech.laundryms.rates.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AddOnCatalogResponse {
    private UUID id;
    private String name;
    private BigDecimal defaultPrice;
    private Boolean isActive;
}
