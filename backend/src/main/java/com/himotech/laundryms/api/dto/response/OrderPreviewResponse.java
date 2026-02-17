package com.himotech.laundryms.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPreviewResponse {
    private Integer totalLoads;
    private Double baseAmount;
    private Double extraMinutesAmount;
    private Double addonsTotalAmount;
    private Double grandTotal;
}
