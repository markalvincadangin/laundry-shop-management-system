package com.highvoltage.laundryms.api.mapper;

import com.highvoltage.laundryms.api.response.PaymentResponse;
import com.highvoltage.laundryms.payments.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "receivedByUserId", source = "receivedBy.id")
    PaymentResponse toResponse(Payment payment);
}
