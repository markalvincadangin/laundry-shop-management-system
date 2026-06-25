package com.himotech.laundryms.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnResponse {
    private String name;
    private Double price;
    private Integer quantity;
}
