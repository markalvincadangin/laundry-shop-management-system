package com.himotech.laundryms.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class UpdateOrderRequest {
    @Min(0)
    private Integer extraMinutes;

    @Valid
    private List<AddOnInput> addOns;
}
