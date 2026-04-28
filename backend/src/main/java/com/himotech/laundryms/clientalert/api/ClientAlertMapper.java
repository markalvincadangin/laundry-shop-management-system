package com.himotech.laundryms.clientalert.api;

import com.himotech.laundryms.clientalert.entity.ClientAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClientAlertMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "referenceNumber", source = "order.referenceNumber")
    @Mapping(target = "customerId", source = "order.customer.id")
    @Mapping(target = "customerName", expression = "java(n.getOrder() != null && n.getOrder().getCustomer() != null ? n.getOrder().getCustomer().getFirstName() + \" \" + n.getOrder().getCustomer().getLastName() : null)")
    @Mapping(target = "contactNumber", source = "order.customer.contactNumber")
    @Mapping(target = "status", expression = "java(n.getStatus() != null ? n.getStatus().name() : null)")
    @Mapping(target = "isRead", source = "read")
    ClientAlertResponse toResponse(ClientAlert n);
}
