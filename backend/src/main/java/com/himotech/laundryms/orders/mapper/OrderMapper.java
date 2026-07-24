package com.himotech.laundryms.orders.mapper;

import com.himotech.laundryms.orders.dto.AddOnResponse;
import com.himotech.laundryms.orders.dto.OrderResponse;
import com.himotech.laundryms.orders.dto.OrderTrackingResponse;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.entity.OrderAddOn;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import com.himotech.laundryms.machines.entity.Machine;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "order", qualifiedByName = "customerName")
    @Mapping(target = "contactNumber", source = "customer.contactNumber")
    @Mapping(target = "createdByUserId", source = "order", qualifiedByName = "createdByUserId")
    @Mapping(target = "createdByUsername", source = "order", qualifiedByName = "createdByUsername")
    @Mapping(target = "serviceRateId", source = "serviceRate.id")
    @Mapping(target = "weightKg", source = "order.weightKg")
    @Mapping(target = "basePricePerLoad", source = "order.basePricePerLoad")
    @Mapping(target = "kgLimitPerLoad", source = "order.kgLimitPerLoad")
    @Mapping(target = "pricePerExtraMinute", source = "order.pricePerExtraMinute")
    @Mapping(target = "baseAmount", source = "order.baseAmount")
    @Mapping(target = "extraMinutesAmount", source = "order.extraMinutesAmount")
    @Mapping(target = "addonsTotalAmount", source = "order.addonsTotalAmount")
    @Mapping(target = "grandTotal", source = "order.grandTotal")
    @Mapping(target = "currentStatus", source = "order.currentStatus")
    @Mapping(target = "paymentStatus", source = "order.paymentStatus")
    @Mapping(target = "addOns", source = "order.addOns", qualifiedByName = "mapAddOns")
    @Mapping(target = "machineIds", source = "order.assignedMachines", qualifiedByName = "mapMachinesToIds")
    @Mapping(target = "isRush", source = "order.isRush")
    @Mapping(target = "auditLogs", ignore = true)
    OrderResponse toResponse(Order order);

    @Named("customerName")
    default String mapCustomerName(Order order) {
        if (order.getCustomer() == null) return "WALK-IN";
        return order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();
    }

    @Named("createdByUserId")
    default String mapCreatedByUserId(Order order) {
        return order.getCreatedBy() != null ? order.getCreatedBy().getId().toString() : null;
    }

    @Named("createdByUsername")
    default String mapCreatedByUsername(Order order) {
        return order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : "System Agent";
    }

    default Double mapBigDecimalToDouble(java.math.BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    default String mapEnumToString(Enum<?> value) {
        return value != null ? value.name() : null;
    }

    @Named("mapAddOns")
    default List<AddOnResponse> mapAddOns(List<OrderAddOn> addOns) {
        if (addOns == null || addOns.isEmpty()) {
            return Collections.emptyList();
        }
        return addOns.stream()
                .map(a -> AddOnResponse.builder()
                        .name(a.getName())
                        .price(a.getPrice() != null ? a.getPrice().doubleValue() : 0.0)
                        .quantity(a.getQuantity() != null ? a.getQuantity() : 1)
                        .build())
                .collect(Collectors.toList());
    }

    @Named("mapMachinesToIds")
    default List<UUID> mapMachinesToIds(Set<Machine> machines) {
        if (machines == null) {
            return Collections.emptyList();
        }
        return machines.stream().map(Machine::getId).collect(Collectors.toList());
    }

    @Mapping(target = "trackingNumber", source = "trackingNumber")
    @Mapping(target = "currentStatus", source = "currentStatus")
    @Mapping(target = "customerName", source = "order", qualifiedByName = "customerName")
    @Mapping(target = "contactNumber", source = "customer.contactNumber")
    @Mapping(target = "grandTotal", source = "order.grandTotal")
    @Mapping(target = "paymentStatus", source = "order.paymentStatus")
    @Mapping(target = "weightKg", source = "order.weightKg")
    @Mapping(target = "totalLoads", source = "totalLoads")
    @Mapping(target = "isRush", source = "order.isRush")
    OrderTrackingResponse toTrackingResponse(Order order);
}