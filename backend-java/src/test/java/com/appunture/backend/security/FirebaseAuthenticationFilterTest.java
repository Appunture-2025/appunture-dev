package com.appunture.backend.security;

import com.appunture.backend.config.SecurityProperties;
import com.appunture.backend.service.FirebaseAuthService;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para FirebaseAuthenticationFilter
 */
@ExtendWith(MockitoExtension.class)
class FirebaseAuthenticationFilterTest {

    private FirebaseAuthenticationFilter filter;

    @Mock
    private FirebaseAuthService firebaseAuthService;

    @Mock
    private SecurityProperties securityProperties;

    @Mock
    private FilterChain filterChain;

    @Mock
    private FirebaseToken firebaseToken;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        filter = new FirebaseAuthenticationFilter(firebaseAuthService, securityProperties);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        request.setRequestURI("/api/test");
        
        lenient().when(firebaseAuthService.isAvailable()).thenReturn(true);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAllowPublicEndpointsWithoutAuthentication() throws Exception {
        // Given
        request.setRequestURI("/api/health/status");

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verify(firebaseAuthService, never()).verifyToken(anyString());
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldAuthenticateValidToken() throws Exception {
        // Given
        String validToken = "valid-firebase-token";
        request.addHeader("Authorization", "Bearer " + validToken);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "USER");
        
        when(firebaseToken.getUid()).thenReturn("test-uid-123");
        when(firebaseToken.getEmail()).thenReturn("test@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.isAuthenticated()).isTrue();
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    void shouldRejectUnverifiedEmailWhenRequired() throws Exception {
        // Given
        String token = "token-unverified-email";
        request.addHeader("Authorization", "Bearer " + token);
        
        lenient().when(firebaseToken.getUid()).thenReturn("test-uid-456");
        lenient().when(firebaseToken.getEmail()).thenReturn("unverified@example.com");
        lenient().when(firebaseToken.isEmailVerified()).thenReturn(false);
        lenient().when(firebaseToken.getClaims()).thenReturn(new HashMap<>());
        lenient().when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(true);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
        assertThat(response.getContentAsString()).contains("email_not_verified");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldAllowUnverifiedEmailWhenNotRequired() throws Exception {
        // Given
        String token = "token-unverified-allowed";
        request.addHeader("Authorization", "Bearer " + token);
        
        Map<String, Object> claims = new HashMap<>();
        when(firebaseToken.getUid()).thenReturn("test-uid-789");
        when(firebaseToken.getEmail()).thenReturn("unverified@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(false);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.isAuthenticated()).isTrue();
    }

    @Test
    void shouldRejectInvalidToken() throws Exception {
        // Given
        String invalidToken = "invalid-token";
        request.addHeader("Authorization", "Bearer " + invalidToken);
        
        when(firebaseAuthService.verifyToken(anyString()))
            .thenThrow(new RuntimeException("Invalid token"));

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
        assertThat(response.getContentAsString()).contains("Invalid or expired token");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldExtractBearerTokenFromAuthorizationHeader() throws Exception {
        // Given
        String token = "extracted-token-test";
        request.addHeader("Authorization", "Bearer " + token);
        
        Map<String, Object> claims = new HashMap<>();
        when(firebaseToken.getUid()).thenReturn("uid-extract");
        when(firebaseToken.getEmail()).thenReturn("extract@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(firebaseAuthService).verifyToken(token);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldSkipAuthenticationWhenNoTokenProvided() throws Exception {
        // Given - sem header Authorization

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(firebaseAuthService, never()).verifyToken(anyString());
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldHandleFirebaseServiceUnavailable() throws Exception {
        // Given
        String token = "token-service-down";
        request.addHeader("Authorization", "Bearer " + token);
        when(firebaseAuthService.isAvailable()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        assertThat(response.getContentAsString()).contains("Authentication service unavailable");
    }

    @Test
    void shouldExtractRoleFromCustomClaims() throws Exception {
        // Given
        String token = "token-with-role";
        request.addHeader("Authorization", "Bearer " + token);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        
        when(firebaseToken.getUid()).thenReturn("admin-uid");
        when(firebaseToken.getEmail()).thenReturn("admin@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    void shouldAssignDefaultRoleWhenNotSpecified() throws Exception {
        // Given
        String token = "token-no-role";
        request.addHeader("Authorization", "Bearer " + token);
        
        Map<String, Object> claims = new HashMap<>(); // Sem role
        
        when(firebaseToken.getUid()).thenReturn("default-uid");
        when(firebaseToken.getEmail()).thenReturn("default@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    void shouldStoreFirebaseDetailsInAuthentication() throws Exception {
        // Given
        String token = "token-with-details";
        request.addHeader("Authorization", "Bearer " + token);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom_field", "custom_value");
        
        when(firebaseToken.getUid()).thenReturn("details-uid");
        when(firebaseToken.getEmail()).thenReturn("details@example.com");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getClaims()).thenReturn(claims);
        when(firebaseAuthService.verifyToken(anyString())).thenReturn(firebaseToken);
        when(securityProperties.isRequireEmailVerified()).thenReturn(false);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getDetails()).isInstanceOf(FirebaseAuthenticationFilter.FirebaseAuthDetails.class);
        
        FirebaseAuthenticationFilter.FirebaseAuthDetails details = 
            (FirebaseAuthenticationFilter.FirebaseAuthDetails) auth.getDetails();
        assertThat(details.getUid()).isEqualTo("details-uid");
        assertThat(details.getEmail()).isEqualTo("details@example.com");
        assertThat(details.isEmailVerified()).isTrue();
        assertThat(details.getClaims()).containsEntry("custom_field", "custom_value");
    }
}
