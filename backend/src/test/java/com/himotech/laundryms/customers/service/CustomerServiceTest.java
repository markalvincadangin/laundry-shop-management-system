package com.himotech.laundryms.customers.service;

import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.support.TestDataBuilders;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CustomerService.
 * Covers: Customer CRUD, duplicate prevention, search.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService Unit Tests")
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("Should persist when new customer")
        void createShouldpersistWhennewcustomer() {
            // Given - no existing customer with same identity
            when(customerRepository.findByLastNameAndFirstNameAndContactNumber("Dela Cruz", "Juan", "09171234567"))
                    .thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

            // When
            customerService.create("Juan", "Dela Cruz", "09171234567");

            // Then
            ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
            verify(customerRepository).save(captor.capture());
            Customer saved = captor.getValue();
            assertThat(saved.getFirstName()).isEqualTo("Juan");
            assertThat(saved.getLastName()).isEqualTo("Dela Cruz");
            assertThat(saved.getContactNumber()).isEqualTo("09171234567");
        }

        @Test
        @DisplayName("Should throw when duplicate identity (same last name, first name, contact)")
        void createShouldthrowWhenduplicateidentity() {
            // Given - customer already exists
            Customer existing = TestDataBuilders.customer().build();
            when(customerRepository.findByLastNameAndFirstNameAndContactNumber("Dela Cruz", "Juan", "09171234567"))
                    .thenReturn(Optional.of(existing));

            // When/Then
            assertThatThrownBy(() -> customerService.create("Juan", "Dela Cruz", "09171234567"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Customer with the same identity already exists");
            verify(customerRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("Should return customer when found")
        void findByIdShouldreturncustomerWhenfound() {
            Customer customer = TestDataBuilders.customer().build();
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

            Optional<Customer> result = customerService.findById(1L);

            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(customer);
        }

        @Test
        @DisplayName("Should return empty when not found")
        void findByIdShouldreturnemptyWhennotfound() {
            when(customerRepository.findById(999L)).thenReturn(Optional.empty());

            Optional<Customer> result = customerService.findById(999L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("search")
    class Search {

        @Test
        @DisplayName("Should delegate to repository with correct specification")
        void searchShoulddelegatetorepository() {
            // Given
            when(customerRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                    .thenReturn(new org.springframework.data.domain.PageImpl<>(
                            List.of(TestDataBuilders.customer().build())));

            // When
            org.springframework.data.domain.Page<Customer> result = customerService.search("Juan", null, null, null,
                    org.springframework.data.domain.PageRequest.of(0, 10));

            // Then
            assertThat(result).hasSize(1);
            verify(customerRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
        }

        @Test
        @DisplayName("Should handle date range conversion correctly")
        void searchShouldhandledaterangeconversion() {
            // Given
            java.time.LocalDate from = java.time.LocalDate.parse("2026-01-01");
            java.time.LocalDate to = java.time.LocalDate.parse("2026-01-31");
            
            when(customerRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                    .thenReturn(org.springframework.data.domain.Page.empty());

            // When
            customerService.search(null, null, from, to, org.springframework.data.domain.PageRequest.of(0, 10));

            // Then
            verify(customerRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
        }
    }
}
