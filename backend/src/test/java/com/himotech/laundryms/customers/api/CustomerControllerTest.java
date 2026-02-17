package com.himotech.laundryms.customers.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.api.dto.request.CreateCustomerRequest;
import com.himotech.laundryms.api.dto.response.CustomerResponse;
import com.himotech.laundryms.api.mapper.CustomerMapper;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.service.CustomerService;
import com.himotech.laundryms.exception.GlobalExceptionHandler;
import com.himotech.laundryms.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API tests for CustomerController.
 * Validates: OpenAPI contract, request validation, response structure, HTTP status codes.
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
        void create_ShouldReturn201_WhenValidRequest() throws Exception {
            // Given
            CreateCustomerRequest request = new CreateCustomerRequest();
            request.setFirstName("Juan");
            request.setLastName("Dela Cruz");
            request.setContactNumber("09171234567");

            Customer saved = Customer.builder()
                    .id(1L)
                    .firstName("Juan")
                    .lastName("Dela Cruz")
                    .contactNumber("09171234567")
                    .build();

            CustomerResponse response = CustomerResponse.builder()
                    .id(1L)
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
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.firstName").value("Juan"))
                    .andExpect(jsonPath("$.lastName").value("Dela Cruz"))
                    .andExpect(jsonPath("$.contactNumber").value("09171234567"));

            verify(customerService).create("Juan", "Dela Cruz", "09171234567");
        }

        @Test
        @DisplayName("Should return 400 when firstName is blank")
        void create_ShouldReturn400_WhenFirstNameBlank() throws Exception {
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
        void create_ShouldReturn400_WhenLastNameMissing() throws Exception {
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
        void create_ShouldReturn400_WhenContactNumberBlank() throws Exception {
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
        void search_ShouldReturn200_WhenQueryProvided() throws Exception {
            Customer c = Customer.builder().id(1L).firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            CustomerResponse resp = CustomerResponse.builder().id(1L).firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            when(customerService.search("Juan")).thenReturn(List.of(c));
            when(customerMapper.toResponse(c)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/customers").param("q", "Juan"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].firstName").value("Juan"));

            verify(customerService).search("Juan");
        }

        @Test
        @DisplayName("Should return 200 and empty array when query blank")
        void search_ShouldReturn200_WhenQueryBlank() throws Exception {
            mockMvc.perform(get("/api/v1/customers").param("q", "   "))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());

            verify(customerService).search("   ");
        }
    }

    @Nested
    @DisplayName("GET /api/v1/customers/{customerId}")
    class GetById {

        @Test
        @DisplayName("Should return 200 and CustomerResponse when found")
        void getById_ShouldReturn200_WhenFound() throws Exception {
            Customer c = Customer.builder().id(1L).firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            CustomerResponse resp = CustomerResponse.builder().id(1L).firstName("Juan").lastName("Dela Cruz").contactNumber("0917").build();
            when(customerService.findById(1L)).thenReturn(Optional.of(c));
            when(customerMapper.toResponse(c)).thenReturn(resp);

            mockMvc.perform(get("/api/v1/customers/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.firstName").value("Juan"));

            verify(customerService).findById(1L);
        }

        @Test
        @DisplayName("Should return 404 when not found")
        void getById_ShouldReturn404_WhenNotFound() throws Exception {
            when(customerService.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/customers/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));

            verify(customerService).findById(999L);
        }
    }
}
