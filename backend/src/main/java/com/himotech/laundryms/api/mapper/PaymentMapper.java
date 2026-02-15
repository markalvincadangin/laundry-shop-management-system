package com.himotech.laundryms.api.mapper;

import com.himotech.laundryms.api.dto.response.PaymentResponse;
import com.himotech.laundryms.payments.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", expression = "java(payment.getOrder() != null ? payment.getOrder().getId() : null)")
    @Mapping(target = "amountPaid", expression = "java(payment.getAmountPaid() != null ? payment.getAmountPaid().doubleValue() : null)")
    @Mapping(target = "paymentMethod", expression = "java(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)")
    @Mapping(target = "receivedByUserId", expression = "java(payment.getReceivedBy() != null ? payment.getReceivedBy().getId().toString() : null)")
    @Mapping(target = "paymentDate", expression = "java(payment.getPaymentDate() != null ? payment.getPaymentDate().atOffset(java.time.ZoneOffset.UTC) : null)")
    PaymentResponse toResponse(Payment payment);
}