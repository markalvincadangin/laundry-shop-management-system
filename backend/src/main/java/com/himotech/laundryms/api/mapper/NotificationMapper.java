package com.himotech.laundryms.api.mapper;

import com.himotech.laundryms.api.dto.response.NotificationResponse;
import com.himotech.laundryms.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "referenceNumber", source = "order.referenceNumber")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(n.getCustomer() != null ? n.getCustomer().getFirstName() + \" \" + n.getCustomer().getLastName() : null)")
    @Mapping(target = "contactNumber", source = "customer.contactNumber")
    @Mapping(target = "status", expression = "java(n.getStatus() != null ? n.getStatus().name() : null)")
    @Mapping(target = "createdAt", expression = "java(n.getCreatedAt() != null ? n.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    @Mapping(target = "sentAt", expression = "java(n.getSentAt() != null ? n.getSentAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    NotificationResponse toResponse(Notification n);
}
