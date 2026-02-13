package com.himotech.laundryms.customers.service;

import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Transactional
    public void create(String firstName, String lastName, String contactNumber) {
        // Check if a customer with the same identity already exists
        if (customerRepository.findByLastNameAndFirstNameAndContactNumber(lastName, firstName, contactNumber).isPresent()) {
            throw new IllegalArgumentException("Customer with the same identity already exists");
        }

        // Create and save the new customer
        Customer customer = Customer.builder()
                .firstName(firstName)
                .lastName(lastName)
                .contactNumber(contactNumber)
                .build();

        customerRepository.save(customer);
    }

    @Transactional
    public Optional<Customer> findById(Long id){
        return customerRepository.findById(id);
    }

    @Transactional
    public List<Customer> search(String query) {
        return customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrContactNumberContaining(query, query, query);
    }

}
