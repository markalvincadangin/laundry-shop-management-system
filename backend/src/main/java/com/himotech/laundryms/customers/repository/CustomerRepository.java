package com.himotech.laundryms.customers.repository;

import com.himotech.laundryms.customers.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Customer entity.
 * Provides database access for customer-related operations.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

        /**
         * Finds a customer by their unique identity (last name, first name, and contact
         * number).
         */
        Optional<Customer> findByLastNameAndFirstNameAndContactNumber(
                        String lastName,
                        String firstName,
                        String contactNumber);

}
