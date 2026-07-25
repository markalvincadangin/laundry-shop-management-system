package com.himotech.laundryms.auth;

import com.himotech.laundryms.auth.domain.RefreshToken;
import com.himotech.laundryms.auth.dto.LoginResult;
import com.himotech.laundryms.auth.repository.RefreshTokenRepository;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private LoginAttemptService loginAttemptService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setPasswordHash("hashed_password");
        testUser.setIsActive(true);
    }

    private String hashToken(String token) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(token.getBytes());
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    @Test
    void testRefresh_Success_RotatesToken() throws Exception {
        // Arrange
        String oldTokenPlain = "old-plain-token";
        String oldTokenHash = hashToken(oldTokenPlain);
        UUID familyId = UUID.randomUUID();
        
        RefreshToken oldToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash(oldTokenHash)
                .familyId(familyId)
                .issuedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .expiresAt(Instant.now().plus(6, ChronoUnit.DAYS))
                .revoked(false)
                .build();
                
        when(refreshTokenRepository.findByTokenHash(oldTokenHash)).thenReturn(Optional.of(oldToken));
        when(jwtService.createToken(testUser)).thenReturn("new-jwt-access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);
        
        // Act
        LoginResult result = authService.refresh(oldTokenPlain);
        
        // Assert
        assertNotNull(result);
        assertEquals("new-jwt-access-token", result.accessToken());
        assertNotNull(result.refreshToken());
        assertNotEquals(oldTokenPlain, result.refreshToken());
        
        assertTrue(oldToken.isRevoked());
        assertNotNull(oldToken.getReplacedBy());
        
        verify(refreshTokenRepository, times(1)).save(oldToken); // Ensure old token updated
        
        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(2)).save(tokenCaptor.capture());
        
        RefreshToken savedNewToken = tokenCaptor.getAllValues().get(0);
        assertEquals(familyId, savedNewToken.getFamilyId());
        assertSame(savedNewToken, oldToken.getReplacedBy());
        
        assertFalse(savedNewToken.isRevoked());
    }

    @Test
    void testRefresh_TokenNotFound() {
        // Arrange
        String plainToken = "non-existent-token";
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authService.refresh(plainToken));
    }
    
    @Test
    void testRefresh_TokenExpired() throws Exception {
        // Arrange
        String tokenPlain = "expired-token";
        String tokenHash = hashToken(tokenPlain);
        
        RefreshToken token = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(UUID.randomUUID())
                .issuedAt(Instant.now().minus(8, ChronoUnit.DAYS))
                .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .revoked(false)
                .build();
                
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        
        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authService.refresh(tokenPlain));
    }
    
    @Test
    void testRefresh_TokenInactive3Days() throws Exception {
        // Arrange
        String tokenPlain = "inactive-token";
        String tokenHash = hashToken(tokenPlain);
        
        RefreshToken token = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(UUID.randomUUID())
                .issuedAt(Instant.now().minus(4, ChronoUnit.DAYS))
                .expiresAt(Instant.now().plus(3, ChronoUnit.DAYS))
                .lastUsedAt(Instant.now().minus(4, ChronoUnit.DAYS))
                .revoked(false)
                .build();
                
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        
        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authService.refresh(tokenPlain));
    }

    @Test
    void testRefresh_TokenReused_RevokesFamily() throws Exception {
        // Arrange
        String tokenPlain = "revoked-token";
        String tokenHash = hashToken(tokenPlain);
        UUID familyId = UUID.randomUUID();
        
        RefreshToken token = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .issuedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .expiresAt(Instant.now().plus(6, ChronoUnit.DAYS))
                .revoked(true) // Attempting to use a revoked token
                .build();
                
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        
        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authService.refresh(tokenPlain));
        
        verify(refreshTokenRepository).revokeFamily(familyId);
    }

    @Test
    void testLogout_Success() throws Exception {
        // Arrange
        String tokenPlain = "logout-token";
        String tokenHash = hashToken(tokenPlain);
        
        RefreshToken token = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash(tokenHash)
                .revoked(false)
                .build();
                
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        
        // Act
        authService.logout(tokenPlain);
        
        // Assert
        assertTrue(token.isRevoked());
        verify(refreshTokenRepository, times(1)).save(token);
    }

    @Test
    void testLogout_NullOrEmptyToken() {
        // Act
        authService.logout(null);
        authService.logout("");
        
        // Assert
        verify(refreshTokenRepository, never()).findByTokenHash(anyString());
    }

    @Test
    void testRevokeAllUserTokens() {
        // Arrange
        UUID userId = UUID.randomUUID();
        
        // Act
        authService.revokeAllUserTokens(userId);
        
        // Assert
        verify(refreshTokenRepository, times(1)).revokeAllForUser(userId);
    }
}
