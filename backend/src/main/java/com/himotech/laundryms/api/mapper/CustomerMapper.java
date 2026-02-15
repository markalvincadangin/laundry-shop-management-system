package com.himotech.laundryms.api.mapper;

import com.himotech.laundryms.api.dto.request.CreateCustomerRequest;
import com.himotech.laundryms.api.dto.response.CustomerResponse;
import com.himotech.laundryms.customers.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CreateCustomerRequest request);

    @Mapping(target = "createdAt", expression = "java(customer.getCreatedAt() != null ? customer.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    @Mapping(target = "updatedAt", expression = "java(customer.getUpdatedAt() != null ? customer.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC) : null)")
    CustomerResponse toResponse(Customer customer);
}