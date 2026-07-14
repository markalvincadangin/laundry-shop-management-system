package com.himotech.laundryms.customers.api;

import com.himotech.laundryms.customers.dto.CreateCustomerRequest;
import com.himotech.laundryms.customers.dto.CustomerResponse;
import com.himotech.laundryms.shared.dto.PageResponse;
import com.himotech.laundryms.customers.mapper.CustomerMapper;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerMapper customerMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = customerService.create(
                request.getFirstName(),
                request.getLastName(),
                request.getContactNumber()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(customerMapper.toResponse(customer));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PageResponse<CustomerResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.by(sortBy).ascending().and(org.springframework.data.domain.Sort.by("id").descending()) 
                : org.springframework.data.domain.Sort.by(sortBy).descending().and(org.springframework.data.domain.Sort.by("id").descending());
        
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100), sort);
        Page<Customer> customersPage = customerService.search(q, isActive, from, to, pageable);
        
        List<CustomerResponse> content = customersPage.getContent().stream()
                .map(customerMapper::toResponse)
                .toList();
                
        return ResponseEntity.ok(PageResponse.<CustomerResponse>builder()
                .content(content)
                .page(customersPage.getNumber())
                .size(customersPage.getSize())
                .totalElements(customersPage.getTotalElements())
                .totalPages(customersPage.getTotalPages())
                .first(customersPage.isFirst())
                .last(customersPage.isLast())
                .build());
    }

    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long customerId) {
        Customer customer = customerService.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{customerId}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> toggleActive(@PathVariable Long customerId) {
        Customer customer = customerService.toggleActive(customerId);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> update(
            @PathVariable Long customerId,
            @Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = customerService.update(
                customerId,
                request.getFirstName(),
                request.getLastName(),
                request.getContactNumber()
        );
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }
}