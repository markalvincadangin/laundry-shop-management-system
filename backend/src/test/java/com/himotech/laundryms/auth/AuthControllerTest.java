package com.himotech.laundryms.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.auth.dto.LoginRequest;
import com.himotech.laundryms.config.AppConfig;
import com.himotech.laundryms.shared.exception.GlobalExceptionHandler;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(com.himotech.laundryms.auth.api.AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({ GlobalExceptionHandler.class, AppConfig.class })
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    AuthService authService;

    @MockitoBean
    com.himotech.laundryms.auth.JwtService jwtService;

    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    PasswordEncoder passwordEncoder;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String TEST_USERNAME = "owner";
    private static final String TEST_PASSWORD = "test-pass-" + UUID.randomUUID();
    private static final String TEST_JWT_SECRET = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");

    @DynamicPropertySource
    static void dynamicProperties(DynamicPropertyRegistry registry) {
        registry.add("app.security.jwt-secret", () -> TEST_JWT_SECRET);
        registry.add("app.security.cookie-name", () -> "access_token");
    }

    @Nested
    @DisplayName("POST /api/v1/auth/login")
    class Login {

        @Test
        @DisplayName("Should return 200 and set cookie when valid credentials")
        void login_ShouldReturn200_WhenValidCredentials() throws Exception {
            User user = User.builder()
                    .id(USER_ID)
                    .username(TEST_USERNAME)
                    .role(com.himotech.laundryms.shared.UserRole.ADMIN)
                    .build();
            when(authService.authenticate(TEST_USERNAME, TEST_PASSWORD)).thenReturn(user);
            when(jwtService.createToken(user)).thenReturn("jwt-token");

            LoginRequest request = new LoginRequest();
            request.setUsername(TEST_USERNAME);
            request.setPassword(TEST_PASSWORD);

            mvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("jwt-token"))
                    .andExpect(jsonPath("$.role").value("ADMIN"))
                    .andExpect(cookie().exists("access_token"))
                    .andExpect(cookie().value("access_token", "jwt-token"));
        }

        @Test
        @DisplayName("Should return 401 when invalid credentials")
        void login_ShouldReturn401_WhenInvalidCredentials() throws Exception {
            when(authService.authenticate(anyString(), anyString()))
                    .thenThrow(new InvalidCredentialsException());

            LoginRequest request = new LoginRequest();
            request.setUsername("wrong");
            request.setPassword("wrong");

            mvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/auth/me")
    class Me {

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void me_ShouldReturn401_WhenNotAuthenticated() throws Exception {
            mvc.perform(get("/api/v1/auth/me"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
