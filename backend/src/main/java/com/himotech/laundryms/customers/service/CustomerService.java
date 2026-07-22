package com.himotech.laundryms.customers.service;

import java.util.UUID;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.config.CacheConfig;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;


    @Auditable(action = "CUSTOMER_CREATE", description = "Register new customer")
    @Transactional
    public Customer create(String firstName, String lastName, String contactNumber) {
        // Check if a customer with the same identity already exists
        if (customerRepository.findByLastNameAndFirstNameAndContactNumber(lastName, firstName, contactNumber)
                .isPresent()) {
            throw new IllegalArgumentException("Customer with the same identity already exists");
        }

        // Create and save the new customer
        Customer customer = Customer.builder()
                .firstName(firstName)
                .lastName(lastName)
                .contactNumber(contactNumber)
                .build();

        customer = customerRepository.save(customer);

        return customer;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_CUSTOMERS, key = "#id")
    public Optional<Customer> findById(UUID id) {
        return customerRepository.findById(id);
    }

    /**
     * Searches customers by query with pagination.
     * Uses CustomerSpecification for dynamic criteria-based filtering.
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Customer> search(
            String query, 
            Boolean isActive, 
            java.time.LocalDate from,
            java.time.LocalDate to, 
            org.springframework.data.domain.Pageable pageable) {
        
        java.time.Instant fromTs = from != null ? from.atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null;
        java.time.Instant toTs = to != null ? to.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null;
        
        org.springframework.data.jpa.domain.Specification<Customer> spec = 
            com.himotech.laundryms.customers.repository.CustomerSpecification.filterBy(
                query != null ? query.trim() : null, 
                isActive, 
                fromTs, 
                toTs
            );
            
        return customerRepository.findAll(spec, pageable);
    }

    /**
     * Updates customer details.
     */
    @Auditable(action = "CUSTOMER_UPDATE", description = "Update customer details")
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_CUSTOMERS, key = "#id")
    public Customer update(UUID id, String firstName, String lastName, String contactNumber) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new com.himotech.laundryms.shared.exception.NotFoundException("Customer not found: " + id));

        if (firstName != null)
            customer.setFirstName(firstName);
        if (lastName != null)
            customer.setLastName(lastName);
        if (contactNumber != null)
            customer.setContactNumber(contactNumber);

        customer = customerRepository.save(customer);

        return customer;
    }

    /**
     * Toggles the active status of a customer.
     */
    @Auditable(action = "CUSTOMER_TOGGLE_ACTIVE", description = "Toggle customer active status")
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_CUSTOMERS, key = "#id")
    public Customer toggleActive(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new com.himotech.laundryms.shared.exception.NotFoundException("Customer not found: " + id));
        customer.setIsActive(!customer.getIsActive());
        customer = customerRepository.save(customer);

        return customer;
    }
}
