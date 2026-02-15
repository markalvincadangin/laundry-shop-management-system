package com.himotech.laundryms.customers.api;

import com.himotech.laundryms.api.dto.request.CreateCustomerRequest;
import com.himotech.laundryms.api.dto.response.CustomerResponse;
import com.himotech.laundryms.api.mapper.CustomerMapper;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerMapper customerMapper;

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = customerService.create(
                request.getFirstName(),
                request.getLastName(),
                request.getContactNumber()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(customerMapper.toResponse(customer));
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> search(@RequestParam(required = false) String q) {
        List<Customer> customers = customerService.search(q);
        return ResponseEntity.ok(customers.stream().map(customerMapper::toResponse).toList());
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long customerId) {
        Customer customer = customerService.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }
}