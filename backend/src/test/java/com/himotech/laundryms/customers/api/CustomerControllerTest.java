package com.himotech.laundryms.customers.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.customers.dto.CreateCustomerRequest;
import com.himotech.laundryms.customers.dto.CustomerResponse;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.mapper.CustomerMapper;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;

/**
 * API tests for CustomerController.
 * Validates: OpenAPI contract, request validation, response structure, HTTP
 * status codes.
 */
@WebMvcTest(controllers = CustomerController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser
@DisplayName("CustomerController API Tests")
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CustomerService customerService;

    @MockitoBean
    private CustomerMapper customerMapper;

    @Nested
    @DisplayName("POST /api/v1/customers")
    class CreateCustomer {

        @Test
        @DisplayName("Should return 201 and CustomerResponse when valid request")
        void createShouldreturn201Whenvalidrequest() throws Exception {
            // Given
            CreateCustomerRequest request = new CreateCustomerRequest();
            request.setFirstName("Juan");
            request.setLastName("Dela Cruz");
            request.setContactNumber("09171234567");

            Customer saved = Customer.builder()
                    .id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                    .firstName("Juan")
                    .lastName("Dela Cruz")
                    .contactNumber("09171234567")
                    .build();

            CustomerResponse response = CustomerResponse.builder()
                    .id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                    .firstName("Juan")
                    .lastName("Dela Cruz")
                    .contactNumber("09171234567")
                    .build();

            when(customerService.create("Juan", "Dela Cruz", "09171234567")).thenReturn(saved);
            when(customerMapper.toResponse(saved)).thenReturn(response);

            // When
            mockMvc.perform(post("/api/v1/customers")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    // Then
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.firstName").value("Juan"))
                    .andExpect(jsonPath("$.lastName").value("Dela Cruz"))
                    .andExpect(jsonPath("$.contactNumber").value("09171234567"));

            verify(customerService).create("Juan", "Dela Cruz", "09171234567");
        }

        @Test
        @DisplayName("Should return 400 when firstName is blank")
        void createShouldreturn400Whenfirstnameblank() throws Exception {
            CreateCustomerRequest request = new CreateCustomerRequest();
            request.setFirstName("   ");
            request.setLastName("Dela Cruz");
            request.setContactNumber("09171234567");

            mockMvc.perform(post("/api/v1/customers")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Should return 400 when lastName is missing")
        void createShouldreturn400Whenlastnamemissing() throws Exception {
            CreateCustomerRequest request = new CreateCustomerRequest();
            request.setFirstName("Juan");
            request.setContactNumber("09171234567");

            mockMvc.perform(post("/api/v1/customers")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when contactNumber is blank")
        void createShouldreturn400Whencontactnumberblank() throws Exception {
            CreateCustomerRequest request = new CreateCustomerRequest();
            request.setFirstName("Juan");
            request.setLastName("Dela Cruz");
            request.setContactNumber("");

            mockMvc.perform(post("/api/v1/customers")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/customers")
    class SearchCustomers {

        @Test
        @DisplayName("Should return 200 and array when query provided")
        void searchShouldreturn200Whenqueryprovided() throws Exception {
            Customer c = Customer.builder().id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                    .firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            CustomerResponse resp = CustomerResponse.builder()
                    .id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000")).firstName("Juan")
                    .lastName("Dela Cruz").contactNumber("0917").build();
            when(customerService.search(eq("Juan"), any(), any(), any(),
                    any(org.springframework.data.domain.Pageable.class)))
                    .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(c)));
            when(customerMapper.toResponse(c)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/customers").param("q", "Juan"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].firstName").value("Juan"));

            verify(customerService).search(eq("Juan"), any(), any(), any(),
                    any(org.springframework.data.domain.Pageable.class));
        }

        @Test
        @DisplayName("Should return 200 and empty array when query blank")
        void searchShouldreturn200Whenqueryblank() throws Exception {
            when(customerService.search(eq("   "), any(), any(), any(),
                    any(org.springframework.data.domain.Pageable.class)))
                    .thenReturn(org.springframework.data.domain.Page.empty());

            mockMvc.perform(get("/api/v1/customers").param("q", "   "))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content").isEmpty());

            verify(customerService).search(eq("   "), any(), any(), any(),
                    any(org.springframework.data.domain.Pageable.class));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/customers/{customerId}")
    class GetById {

        @Test
        @DisplayName("Should return 200 and CustomerResponse when found")
        void getByIdShouldreturn200Whenfound() throws Exception {
            Customer c = Customer.builder().id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                    .firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            CustomerResponse resp = CustomerResponse.builder()
                    .id(java.util.UUID.fromString("123e4567-e89b-12d3-a456-426614174000")).firstName("Juan")
                    .lastName("Dela Cruz").contactNumber("0917").build();
            when(customerService.findById(UUID.fromString("123e4567-e89b-12d3-a456-426614174000")))
                    .thenReturn(Optional.of(c));
            when(customerMapper.toResponse(c)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/customers/123e4567-e89b-12d3-a456-426614174000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.firstName").value("Juan"));

            verify(customerService).findById(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
        }

        @Test
        @DisplayName("Should return 404 when not found")
        void getByIdShouldreturn404Whennotfound() throws Exception {
            when(customerService.findById(UUID.fromString("999e4567-e89b-12d3-a456-426614174999")))
                    .thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/customers/999e4567-e89b-12d3-a456-426614174999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));

            verify(customerService).findById(UUID.fromString("999e4567-e89b-12d3-a456-426614174999"));
        }
    }
}
