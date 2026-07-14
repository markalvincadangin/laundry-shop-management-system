package com.himotech.laundryms.customers.repository;

import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence Integration Tests for CustomerRepository.
 *
 * <p><b>Database Constraint Being Tested:</b>
 * <pre>
 * CONSTRAINT uq_customers_identity UNIQUE (last_name, first_name, contact_number)
 * </pre>
 *
 * <p>This constraint prevents duplicate customer records by enforcing uniqueness
 * on the combination of (last_name, first_name, contact_number).
 *
 * <p>As defined in V1__init.sql and erd.dbml, a customer is uniquely identified by
 * their full name and contact number combination.
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("CustomerRepository Persistence Integration Tests")
class CustomerRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * Test 1: Basic persistence test - verify a valid customer can be saved and retrieved.
     */
    @Test
    @DisplayName("save - Should persist customer when valid")
    void saveShouldpersistcustomerWhenvalid() {
        // Given
        Customer customer = Customer.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .contactNumber("09171234567")
                .build();

        // When
        Customer saved = customerRepository.save(customer);
        entityManager.flush();
        entityManager.clear();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFirstName()).isEqualTo("Juan");
        assertThat(saved.getLastName()).isEqualTo("Dela Cruz");
        assertThat(saved.getContactNumber()).isEqualTo("09171234567");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();

        // Verify persistence
        Customer retrieved = customerRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getFirstName()).isEqualTo("Juan");
    }

    /**
     * Test 2: CRITICAL - Verify UNIQUE constraint (last_name, first_name, contact_number).
     *
     * <p><b>Constraint from V1__init.sql:</b>
     * <pre>
     * CONSTRAINT uq_customers_identity UNIQUE (last_name, first_name, contact_number)
     * </pre>
     *
     * <p>Attempting to insert a duplicate customer (same name AND contact) must throw
     * {@link DataIntegrityViolationException}.
     */
    @Test
    @DisplayName("save - Should throw DataIntegrityViolation when duplicate (lastName, firstName, contact)")
    void saveShouldthrowdataintegrityviolationWhenduplicateprofile() {
        // Given - First customer
        Customer customer1 = Customer.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .contactNumber("09171234567")
                .build();
        customerRepository.save(customer1);
        entityManager.flush();
        entityManager.clear();

        // When/Then - Attempt to save duplicate (exact same lastName, firstName, contactNumber)
        Customer customer2 = Customer.builder()
                .firstName("Juan")  // Same first name
                .lastName("Cruz")   // Same last name
                .contactNumber("09171234567")  // Same contact number
                .build();

        assertThatThrownBy(() -> {
            customerRepository.save(customer2);
            entityManager.flush();
        })
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("uq_customers_identity");
    }

    /**
     * Test 3: Verify that customers with the same name but different contact numbers are allowed.
     *
     * <p>The UNIQUE constraint is on (last_name, first_name, contact_number), so changing
     * ANY of these three fields should allow insertion.
     */
    @Test
    @DisplayName("Should allow customers with same name but different contact")
    void shouldAllowCustomersWithSameNameButDifferentContact() {
        // Given - Customer with contact "09171234567"
        Customer customer1 = Customer.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .contactNumber("09171234567")
                .build();
        customerRepository.save(customer1);
        entityManager.flush();

        // When - Same name, different contact
        Customer customer2 = Customer.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .contactNumber("09181234567")  // Different contact number
                .build();
        Customer saved = customerRepository.save(customer2);
        entityManager.flush();

        // Then - Should succeed (different contact breaks uniqueness)
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isNotEqualTo(customer1.getId());
    }

    /**
     * Test 4: Verify that customers with the same contact but different names are allowed.
     */
    @Test
    @DisplayName("Should allow customers with same contact but different names")
    void shouldAllowCustomersWithSameContactButDifferentNames() {
        // Given - "Juan Cruz" with contact "09171234567"
        Customer customer1 = Customer.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .contactNumber("09171234567")
                .build();
        customerRepository.save(customer1);
        entityManager.flush();

        // When - Different name, same contact
        Customer customer2 = Customer.builder()
                .firstName("Maria")  // Different first name
                .lastName("Santos")  // Different last name
                .contactNumber("09171234567")  // Same contact number
                .build();
        Customer saved = customerRepository.save(customer2);
        entityManager.flush();

        // Then - Should succeed (different name breaks uniqueness)
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isNotEqualTo(customer1.getId());
    }
}

