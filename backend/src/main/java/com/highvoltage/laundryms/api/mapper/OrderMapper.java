package com.highvoltage.laundryms.api.mapper;

import com.highvoltage.laundryms.api.response.OrderResponse;
import com.highvoltage.laundryms.orders.LaundryOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "createdByUserId", source = "createdBy.id")
    OrderResponse toResponse(LaundryOrder order);
}
