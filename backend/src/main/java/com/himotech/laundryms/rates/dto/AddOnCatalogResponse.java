package com.himotech.laundryms.rates.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AddOnCatalogResponse {
    private Integer id;
    private String name;
    private BigDecimal defaultPrice;
    private Boolean isActive;
}
