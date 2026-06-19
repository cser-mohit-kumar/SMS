package com.stationery.auth.service;

import com.stationery.auth.dto.AuthResponse;
import com.stationery.auth.dto.LoginRequest;
import com.stationery.auth.dto.RegisterRequest;
import com.stationery.auth.model.Role;
import com.stationery.auth.model.User;
import com.stationery.auth.model.RefreshToken;
import com.stationery.auth.repository.UserRepository;
import com.stationery.auth.security.JwtUtil;
import com.stationery.auth.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Test Suite")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private Authentication authentication;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role("STUDENT")
                .build();

        loginRequest = LoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void testRegisterSuccess() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtUtil.generateToken("testuser", "STUDENT")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken("testuser")).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").build()
        );

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("STUDENT", response.getRole());
        assertEquals("jwt-token", response.getToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals("User registered successfully", response.getMessage());

        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken("testuser", "STUDENT");
        verify(refreshTokenService).createRefreshToken("testuser");
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void testRegisterUsernameTaken() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        assertEquals("Username already exists: testuser", exception.getMessage());

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testRegisterEmailTaken() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        assertEquals("Email already exists: test@example.com", exception.getMessage());

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should register with STUDENT role when invalid role is provided")
    void testRegisterInvalidRoleDefaultsToStudent() {
        registerRequest.setRole("INVALID_ROLE");
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtUtil.generateToken("testuser", "STUDENT")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken("testuser")).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").build()
        );

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("STUDENT", response.getRole());
        assertEquals("mock-refresh-token", response.getRefreshToken());
    }

    @Test
    @DisplayName("Should login user successfully")
    void testLoginSuccess() {
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("testuser", "STUDENT")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken("testuser")).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").build()
        );

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("STUDENT", response.getRole());
        assertEquals("jwt-token", response.getToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals("Login successful", response.getMessage());

        verify(authenticationManager).authenticate(any());
        verify(jwtUtil).generateToken("testuser", "STUDENT");
        verify(refreshTokenService).createRefreshToken("testuser");
    }

    @Test
    @DisplayName("Should throw exception when user not found during login")
    void testLoginUserNotFound() {
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("User not found: testuser", exception.getMessage());

        verify(authenticationManager).authenticate(any());
    }

    @Test
    @DisplayName("Should validate token successfully")
    void testValidateTokenSuccess() {
        when(jwtUtil.validateToken("valid-token")).thenReturn(true);

        boolean isValid = authService.validateToken("valid-token");

        assertTrue(isValid);
        verify(jwtUtil).validateToken("valid-token");
    }

    @Test
    @DisplayName("Should return false for invalid token")
    void testValidateTokenFailure() {
        when(jwtUtil.validateToken("invalid-token")).thenReturn(false);

        boolean isValid = authService.validateToken("invalid-token");

        assertFalse(isValid);
        verify(jwtUtil).validateToken("invalid-token");
    }

    @Test
    @DisplayName("Should register user with ADMIN role")
    void testRegisterAdminUser() {
        registerRequest.setRole("ADMIN");
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtUtil.generateToken("testuser", "ADMIN")).thenReturn("admin-jwt-token");
        when(refreshTokenService.createRefreshToken("testuser")).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").build()
        );

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("ADMIN", response.getRole());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        verify(jwtUtil).generateToken("testuser", "ADMIN");
        verify(refreshTokenService).createRefreshToken("testuser");
    }
}
