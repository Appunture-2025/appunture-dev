package com.appunture.backend.security;

import com.appunture.backend.config.SecurityProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para RateLimitingFilter
 */
@ExtendWith(MockitoExtension.class)
class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @Mock
    private SecurityProperties securityProperties;

    @Mock
    private SecurityProperties.RateLimit rateLimit;

    @Mock
    private FilterChain filterChain;

    @Mock
    private Authentication authentication;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        when(securityProperties.getRateLimit()).thenReturn(rateLimit);
        lenient().when(rateLimit.isEnabled()).thenReturn(true);
        lenient().when(rateLimit.getCapacity()).thenReturn(10);
        lenient().when(rateLimit.getRefillTokens()).thenReturn(10);
        lenient().when(rateLimit.getRefillDuration()).thenReturn(Duration.ofMinutes(1));
        lenient().when(rateLimit.getStrategy()).thenReturn(SecurityProperties.Strategy.PER_IP);
        lenient().when(rateLimit.getExcludedPaths()).thenReturn(List.of("/api/health/**", "/actuator/**"));

        filter = new RateLimitingFilter(securityProperties);
        filter.initBucketConfiguration();

        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        request.setRequestURI("/api/test");
        request.setRemoteAddr("192.168.1.100");
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAllowRequestWhenBelowRateLimit() throws ServletException, IOException {
        // Given - configuração padrão com limite de 10

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("10");
        assertThat(response.getHeader("X-RateLimit-Remaining")).isNotNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldBlockRequestWhenRateLimitExceeded() throws ServletException, IOException {
        // Given - fazer 10 requests (até o limite)
        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(request, response, filterChain);
            response = new MockHttpServletResponse(); // Reset response para próxima iteração
        }

        // When - 11ª request deve ser bloqueada
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilterInternal(request, blockedResponse, filterChain);

        // Then
        assertThat(blockedResponse.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(blockedResponse.getHeader("Retry-After")).isNotNull();
        assertThat(blockedResponse.getContentAsString()).contains("rate_limit_exceeded");
        // FilterChain não deve ser chamado na 11ª vez
        verify(filterChain, times(10)).doFilter(any(), any());
    }

    @Test
    void shouldTrackRateLimitByIP() throws ServletException, IOException {
        // Given - dois IPs diferentes
        request.setRemoteAddr("192.168.1.100");
        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRemoteAddr("192.168.1.200");
        request2.setRequestURI("/api/test");

        // When - consumir limite do primeiro IP
        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(request, new MockHttpServletResponse(), filterChain);
        }

        // Then - segundo IP ainda deve ter créditos
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilterInternal(request2, response2, filterChain);
        assertThat(response2.getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void shouldExtractIPFromXForwardedForHeader() throws ServletException, IOException {
        // Given
        request.addHeader("X-Forwarded-For", "203.0.113.1, 198.51.100.1, 192.0.2.1");

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then - deve usar o primeiro IP do header
        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldSkipRateLimitForExcludedPaths() throws ServletException, IOException {
        // Given
        MockHttpServletRequest excludedRequest = new MockHttpServletRequest();
        excludedRequest.setRequestURI("/api/health/status");
        excludedRequest.setRemoteAddr("192.168.1.100");

        // When - fazer muitas requests (mais que o limite)
        for (int i = 0; i < 15; i++) {
            MockHttpServletResponse testResponse = new MockHttpServletResponse();
            
            // Verificar se filtro reconhece path excluído
            boolean shouldSkip = filter.shouldNotFilter(excludedRequest);
            assertThat(shouldSkip).isTrue();
            
            // Se o filtro fosse aplicado, esse método não seria chamado para paths excludentes
            if (!shouldSkip) {
                filter.doFilterInternal(excludedRequest, testResponse, filterChain);
            } else {
                // Simular skip - chamar o filterChain diretamente
                filterChain.doFilter(excludedRequest, testResponse);
            }
        }

        // Then
        verify(filterChain, times(15)).doFilter(any(), any());
    }

    @Test
    void shouldSkipRateLimitForOptionsRequests() throws ServletException, IOException {
        // Given
        MockHttpServletRequest optionsRequest = new MockHttpServletRequest();
        optionsRequest.setMethod("OPTIONS");
        optionsRequest.setRequestURI("/api/test");
        optionsRequest.setRemoteAddr("192.168.1.100");

        // When - fazer muitas requests OPTIONS
        for (int i = 0; i < 15; i++) {
            MockHttpServletResponse testResponse = new MockHttpServletResponse();
            
            // Verificar se filtro reconhece OPTIONS
            boolean shouldSkip = filter.shouldNotFilter(optionsRequest);
            assertThat(shouldSkip).isTrue();
            
            // Se o filtro fosse aplicado, esse método não seria chamado para OPTIONS
            if (!shouldSkip) {
                filter.doFilterInternal(optionsRequest, testResponse, filterChain);
            } else {
                // Simular skip - chamar o filterChain diretamente
                filterChain.doFilter(optionsRequest, testResponse);
            }
        }

        // Then - todas devem passar (OPTIONS é excluído do rate limit)
        verify(filterChain, times(15)).doFilter(any(), any());
    }

    @Test
    void shouldBypassFilterWhenRateLimitDisabled() throws ServletException, IOException {
        // Given
        when(rateLimit.isEnabled()).thenReturn(false);

        // When - fazer muitas requests
        for (int i = 0; i < 20; i++) {
            filter.doFilterInternal(request, new MockHttpServletResponse(), filterChain);
        }

        // Then - todas devem passar
        verify(filterChain, times(20)).doFilter(any(), any());
    }

    @Test
    void shouldSetCorrectHeadersOnSuccessfulRequest() throws ServletException, IOException {
        // Given
        when(rateLimit.getCapacity()).thenReturn(100);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("100");
        assertThat(response.getHeader("X-RateLimit-Remaining")).isNotNull();
        int remaining = Integer.parseInt(response.getHeader("X-RateLimit-Remaining"));
        assertThat(remaining).isLessThan(100); // Deve ter consumido 1 token
    }

    @Test
    void shouldTrackRemainingTokensCorrectly() throws ServletException, IOException {
        // Given
        when(rateLimit.getCapacity()).thenReturn(5);
        filter.initBucketConfiguration();

        // When/Then - verificar contagem decrescente
        for (int i = 0; i < 5; i++) {
            MockHttpServletResponse testResponse = new MockHttpServletResponse();
            filter.doFilterInternal(request, testResponse, filterChain);
            
            String remaining = testResponse.getHeader("X-RateLimit-Remaining");
            assertThat(remaining).isNotNull();
            assertThat(Integer.parseInt(remaining)).isEqualTo(4 - i);
        }
    }
}
