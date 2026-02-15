package com.himotech.laundryms.api.mapper;

import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.dto.response.OrderTrackingResponse;
import com.himotech.laundryms.orders.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "createdByUserId", expression = "java(order.getCreatedBy() != null ? order.getCreatedBy().getId().toString() : null)")
    @Mapping(target = "serviceRateId", source = "serviceRate.id")
    @Mapping(target = "weightKg", expression = "java(order.getWeightKg() != null ? order.getWeightKg().doubleValue() : null)")
    @Mapping(target = "baseAmount", expression = "java(order.getBaseAmount() != null ? order.getBaseAmount().doubleValue() : null)")
    @Mapping(target = "extraMinutesAmount", expression = "java(order.getExtraMinutesAmount() != null ? order.getExtraMinutesAmount().doubleValue() : null)")
    @Mapping(target = "addonsTotalAmount", expression = "java(order.getAddonsTotalAmount() != null ? order.getAddonsTotalAmount().doubleValue() : null)")
    @Mapping(target = "grandTotal", expression = "java(order.getGrandTotal() != null ? order.getGrandTotal().doubleValue() : null)")
    @Mapping(target = "currentStatus", expression = "java(order.getCurrentStatus() != null ? order.getCurrentStatus().name() : null)")
    @Mapping(target = "paymentStatus", expression = "java(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)")
    @Mapping(target = "createdAt", expression = "java(order.getCreatedAt() != null ? order.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    @Mapping(target = "updatedAt", expression = "java(order.getUpdatedAt() != null ? order.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    OrderResponse toResponse(Order order);

    @Mapping(target = "referenceNumber", source = "referenceNumber")
    @Mapping(target = "currentStatus", expression = "java(order.getCurrentStatus() != null ? order.getCurrentStatus().name() : null)")
    @Mapping(target = "customerName", expression = "java(order.getCustomer() != null ? order.getCustomer().getFirstName() + \" \" + order.getCustomer().getLastName() : null)")
    @Mapping(target = "contactNumber", source = "customer.contactNumber")
    @Mapping(target = "createdAt", expression = "java(order.getCreatedAt() != null ? order.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    @Mapping(target = "grandTotal", expression = "java(order.getGrandTotal() != null ? order.getGrandTotal().doubleValue() : null)")
    @Mapping(target = "paymentStatus", expression = "java(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)")
    OrderTrackingResponse toTrackingResponse(Order order);
}