package com.appunture.backend.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

/**
 * Testes unitários para CorrelationIdFilter
 */
@ExtendWith(MockitoExtension.class)
class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;

    @Mock
    private FilterChain filterChain;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        MDC.clear(); // Limpa MDC antes de cada teste
    }

    @Test
    void shouldExtractCorrelationIdFromRequestHeader() throws ServletException, IOException {
        // Given
        String expectedCorrelationId = "test-correlation-123";
        request.addHeader("X-Correlation-ID", expectedCorrelationId);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getHeader("X-Correlation-ID")).isEqualTo(expectedCorrelationId);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldGenerateCorrelationIdWhenNotPresent() throws ServletException, IOException {
        // Given - sem header X-Correlation-ID

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        String correlationId = response.getHeader("X-Correlation-ID");
        assertThat(correlationId).isNotNull();
        assertThat(correlationId).matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAddCorrelationIdToMDC() throws ServletException, IOException {
        // Given
        String expectedCorrelationId = "mdc-test-456";
        request.addHeader("X-Correlation-ID", expectedCorrelationId);

        // When
        filter.doFilterInternal(request, response, (req, res) -> {
            // Verifica dentro do filtro que MDC está setado
            assertThat(MDC.get("correlationId")).isEqualTo(expectedCorrelationId);
        });

        // Then - MDC deve ser limpo após o filtro
        assertThat(MDC.get("correlationId")).isNull();
    }

    @Test
    void shouldCleanUpMDCEvenWhenExceptionOccurs() {
        // Given
        String correlationId = "cleanup-test-789";
        request.addHeader("X-Correlation-ID", correlationId);

        // When
        try {
            filter.doFilterInternal(request, response, (req, res) -> {
                throw new ServletException("Simulated error");
            });
        } catch (Exception e) {
            // Esperado
        }

        // Then - MDC deve ser limpo mesmo com exceção
        assertThat(MDC.get("correlationId")).isNull();
    }

    @Test
    void shouldUseUUIDFormatWhenGeneratingId() throws ServletException, IOException {
        // Given - 10 requisições sem correlation ID

        // When/Then
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest();
            MockHttpServletResponse res = new MockHttpServletResponse();
            
            filter.doFilterInternal(req, res, filterChain);
            
            String correlationId = res.getHeader("X-Correlation-ID");
            assertThat(correlationId)
                .matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}");
        }
    }
}
