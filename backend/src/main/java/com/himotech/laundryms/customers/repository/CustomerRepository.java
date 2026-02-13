package com.himotech.laundryms.customers.repository;

import com.himotech.laundryms.customers.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Customer entity.
 * Provides database access for customer-related operations.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Finds a customer by their unique identity (last name, first name, and contact number).
     * This enforces the unique constraint defined in the database schema.
     *
     * @param lastName the customer's last name
     * @param firstName the customer's first name
     * @param contactNumber the customer's contact number
     * @return an Optional containing the customer if found, empty otherwise
     */
    Optional<Customer> findByLastNameAndFirstNameAndContactNumber(
            String lastName,
            String firstName,
            String contactNumber
    );

    @Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR c.contactNumber LIKE CONCAT('%', :q, '%')")
    List<Customer> search(@Param("q") String query);
}

