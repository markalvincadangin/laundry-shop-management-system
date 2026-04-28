package com.himotech.laundryms.api.mapper;

import com.himotech.laundryms.api.dto.response.AddOnResponse;
import com.himotech.laundryms.api.dto.response.OrderResponse;
import com.himotech.laundryms.api.dto.response.OrderTrackingResponse;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.entity.OrderAddOn;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(order.getCustomer() != null ? order.getCustomer().getFirstName() + \" \" + order.getCustomer().getLastName() : null)")
    @Mapping(target = "createdByUserId", expression = "java(order.getCreatedBy() != null ? order.getCreatedBy().getId().toString() : null)")
    @Mapping(target = "createdByUsername", expression = "java(order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : \"System Agent\")")
    @Mapping(target = "serviceRateId", source = "serviceRate.id")
    @Mapping(target = "weightKg", expression = "java(order.getWeightKg() != null ? order.getWeightKg().doubleValue() : null)")
    @Mapping(target = "baseAmount", expression = "java(order.getBaseAmount() != null ? order.getBaseAmount().doubleValue() : null)")
    @Mapping(target = "extraMinutesAmount", expression = "java(order.getExtraMinutesAmount() != null ? order.getExtraMinutesAmount().doubleValue() : null)")
    @Mapping(target = "addonsTotalAmount", expression = "java(order.getAddonsTotalAmount() != null ? order.getAddonsTotalAmount().doubleValue() : null)")
    @Mapping(target = "grandTotal", expression = "java(order.getGrandTotal() != null ? order.getGrandTotal().doubleValue() : null)")
    @Mapping(target = "currentStatus", expression = "java(order.getCurrentStatus() != null ? order.getCurrentStatus().name() : null)")
    @Mapping(target = "paymentStatus", expression = "java(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)")
    @Mapping(target = "auditLogs", ignore = true)
    OrderResponse toResponse(Order order);

    @AfterMapping
    default void setAddOns(Order order, @MappingTarget OrderResponse response) {
        response.setAddOns(mapAddOns(order.getAddOns()));
    }

    default List<AddOnResponse> mapAddOns(List<OrderAddOn> addOns) {
        if (addOns == null || addOns.isEmpty()) {
            return Collections.emptyList();
        }
        return addOns.stream()
                .map(a -> AddOnResponse.builder()
                        .name(a.getName())
                        .price(a.getPrice())
                        .quantity(a.getQuantity())
                        .build())
                .collect(Collectors.toList());
    }

    @Mapping(target = "referenceNumber", source = "referenceNumber")
    @Mapping(target = "currentStatus", expression = "java(order.getCurrentStatus() != null ? order.getCurrentStatus().name() : null)")
    @Mapping(target = "customerName", expression = "java(order.getCustomer() != null ? order.getCustomer().getFirstName() + \" \" + order.getCustomer().getLastName() : null)")
    @Mapping(target = "contactNumber", source = "customer.contactNumber")
    @Mapping(target = "grandTotal", expression = "java(order.getGrandTotal() != null ? order.getGrandTotal().doubleValue() : null)")
    @Mapping(target = "paymentStatus", expression = "java(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)")
    @Mapping(target = "weightKg", expression = "java(order.getWeightKg() != null ? order.getWeightKg().doubleValue() : null)")
    @Mapping(target = "totalLoads", source = "totalLoads")
    OrderTrackingResponse toTrackingResponse(Order order);
}