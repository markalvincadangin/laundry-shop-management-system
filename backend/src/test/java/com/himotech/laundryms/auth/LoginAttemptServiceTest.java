package com.himotech.laundryms.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class LoginAttemptServiceTest {

    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        loginAttemptService = new LoginAttemptService();
    }

    @Test
    void testLoginSucceeded_ResetsAttempts() {
        String username = "user1";
        loginAttemptService.loginFailed(username);
        loginAttemptService.loginFailed(username);

        assertTrue(loginAttemptService.isBlocked(username) == false);

        loginAttemptService.loginSucceeded(username);

        assertFalse(loginAttemptService.isBlocked(username));
    }

    @Test
    void testLoginFailed_BlocksAfterMaxAttempts() {
        String username = "user2";

        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(username);
            assertFalse(loginAttemptService.isBlocked(username));
        }

        loginAttemptService.loginFailed(username);
        assertTrue(loginAttemptService.isBlocked(username));
    }

    @Test
    void testIsBlocked_ExpiresAfterTimeout() {
        String username = "user3";

        for (int i = 0; i < 5; i++) {
            loginAttemptService.loginFailed(username);
        }
        assertTrue(loginAttemptService.isBlocked(username));

        // Hack to simulate time passing (15+ minutes) by modifying the internal map via reflection
        Map<String, LoginAttemptService.AttemptData> attempts = 
            (Map<String, LoginAttemptService.AttemptData>) ReflectionTestUtils.getField(loginAttemptService, "attempts");
        
        LoginAttemptService.AttemptData data = attempts.get(username);
        data.setLockedUntil(Instant.now().minus(1, ChronoUnit.MINUTES));

        assertFalse(loginAttemptService.isBlocked(username));
    }

    @Test
    void staleFailuresDoNotContributeToLockout() {
        String username = "user4";
        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(username);
        }
        Map<String, LoginAttemptService.AttemptData> attempts =
                (Map<String, LoginAttemptService.AttemptData>) ReflectionTestUtils.getField(loginAttemptService, "attempts");
        attempts.get(username).setFirstFailedAt(Instant.now().minus(16, ChronoUnit.MINUTES));

        loginAttemptService.loginFailed(username);

        assertFalse(loginAttemptService.isBlocked(username));
    }
}
