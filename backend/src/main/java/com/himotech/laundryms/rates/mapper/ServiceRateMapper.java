package com.himotech.laundryms.rates.mapper;

import com.himotech.laundryms.rates.dto.ServiceRateResponse;
import com.himotech.laundryms.rates.entity.ServiceRate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceRateMapper {

    @Mapping(target = "basePricePerLoad", expression = "java(rate.getBasePricePerLoad().doubleValue())")
    @Mapping(target = "kgLimitPerLoad", expression = "java(rate.getKgLimitPerLoad().doubleValue())")
    @Mapping(target = "pricePerExtraMinute", expression = "java(rate.getPricePerExtraMinute().doubleValue())")
    ServiceRateResponse toResponse(ServiceRate rate);
}