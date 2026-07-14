package com.himotech.laundryms.customers.mapper;

import com.himotech.laundryms.customers.dto.CreateCustomerRequest;
import com.himotech.laundryms.customers.dto.CustomerResponse;
import com.himotech.laundryms.customers.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Customer toEntity(CreateCustomerRequest request);

    CustomerResponse toResponse(Customer customer);
}