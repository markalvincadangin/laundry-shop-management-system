package com.himotech.laundryms.customers.repository;

import com.himotech.laundryms.customers.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Repository interface for Customer entity.
 * Provides database access for customer-related operations.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

        /**
         * Finds a customer by their unique identity (last name, first name, and contact
         * number).
         */
        Optional<Customer> findByLastNameAndFirstNameAndContactNumber(
                        String lastName,
                        String firstName,
                        String contactNumber);

        @Query(value = "SELECT c FROM Customer c WHERE " +
                        "(CAST(:q AS text) IS NULL OR :q = '' OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
                        "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
                        "OR c.contactNumber LIKE CONCAT('%', :q, '%')) AND " +
                        "(CAST(:isActive AS boolean) IS NULL OR c.isActive = :isActive) AND " +
                        "(CAST(:fromTs AS timestamp) IS NULL OR c.createdAt >= :fromTs) AND " +
                        "(CAST(:toTs AS timestamp) IS NULL OR c.createdAt < :toTs)",
               countQuery = "SELECT COUNT(c) FROM Customer c WHERE " +
                        "(CAST(:q AS text) IS NULL OR :q = '' OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
                        "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
                        "OR c.contactNumber LIKE CONCAT('%', :q, '%')) AND " +
                        "(CAST(:isActive AS boolean) IS NULL OR c.isActive = :isActive) AND " +
                        "(CAST(:fromTs AS timestamp) IS NULL OR c.createdAt >= :fromTs) AND " +
                        "(CAST(:toTs AS timestamp) IS NULL OR c.createdAt < :toTs)")
        Page<Customer> search(
                @Param("q") String query, 
                @Param("isActive") Boolean isActive,
                @Param("fromTs") java.time.Instant fromTs, 
                @Param("toTs") java.time.Instant toTs, 
                Pageable pageable);
}
