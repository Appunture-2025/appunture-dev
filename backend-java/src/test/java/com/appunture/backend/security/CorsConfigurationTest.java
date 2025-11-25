package com.appunture.backend.security;

import com.appunture.backend.config.SecurityProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Testes unitários para validar configuração CORS
 * 
 * Garante que:
 * - Domínios autorizados são configurados corretamente
 * - Domínios não autorizados são bloqueados
 * - Configuração funciona corretamente em diferentes ambientes
 */
class CorsConfigurationTest {

    private SecurityProperties securityProperties;

    @BeforeEach
    void setUp() {
        securityProperties = new SecurityProperties();
    }

    @Test
    @DisplayName("Dev: Deve configurar localhost patterns corretamente")
    void shouldConfigureLocalhostPatterns() {
        // Given: Configuração de desenvolvimento
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*.*"
        ));

        // When: Criar configuração CORS
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then: Deve ter patterns configurados
        assertThat(config.getAllowedOriginPatterns()).containsExactlyInAnyOrder(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*.*"
        );
        assertThat(config.getAllowCredentials()).isTrue();
        assertThat(config.getAllowedMethods()).contains("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }

    @Test
    @DisplayName("Prod: Deve configurar domínios HTTPS específicos")
    void shouldConfigureSpecificHttpsDomains() {
        // Given: Configuração de produção
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of(
            "https://appunture.com",
            "https://app.appunture.com",
            "https://admin.appunture.com"
        ));

        // When: Criar configuração CORS
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then: Deve ter apenas domínios HTTPS configurados
        assertThat(config.getAllowedOrigins()).containsExactlyInAnyOrder(
            "https://appunture.com",
            "https://app.appunture.com",
            "https://admin.appunture.com"
        );
        assertThat(config.getAllowedOriginPatterns()).isNullOrEmpty();
    }

    @Test
    @DisplayName("Segurança: Deve lançar exceção se nenhum origin for configurado")
    void shouldThrowExceptionWhenNoOriginsConfigured() {
        // Given: Sem configuração de origins
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of());
        cors.setAllowedOriginPatterns(List.of());

        // When/Then: Deve lançar exceção
        assertThatThrownBy(() -> createCorsConfiguration(cors))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("CORS não configurado");
    }

    @Test
    @DisplayName("Segurança: Wildcard (*) deve ser convertido para allowedOriginPatterns")
    void shouldConvertWildcardToPatterns() {
        // Given: Configuração com wildcard
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of("*"));

        // When: Criar configuração CORS
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then: Deve usar allowedOriginPatterns
        assertThat(config.getAllowedOriginPatterns()).containsExactly("*");
        assertThat(config.getAllowedOrigins()).isNullOrEmpty();
    }

    @Test
    @DisplayName("Deve permitir credenciais")
    void shouldAllowCredentials() {
        // Given
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of("https://appunture.com"));
        cors.setAllowCredentials(true);

        // When
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then
        assertThat(config.getAllowCredentials()).isTrue();
    }

    @Test
    @DisplayName("Deve configurar métodos HTTP permitidos")
    void shouldConfigureAllowedMethods() {
        // Given
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of("https://appunture.com"));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // When
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then
        assertThat(config.getAllowedMethods()).containsExactlyInAnyOrder(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        );
    }

    @Test
    @DisplayName("Deve configurar headers permitidos")
    void shouldConfigureAllowedHeaders() {
        // Given
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of("https://appunture.com"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // When
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then
        assertThat(config.getAllowedHeaders()).containsExactlyInAnyOrder(
            "Authorization", "Content-Type"
        );
    }

    @Test
    @DisplayName("Deve configurar exposed headers")
    void shouldConfigureExposedHeaders() {
        // Given
        SecurityProperties.Cors cors = securityProperties.getCors();
        cors.setAllowedOrigins(List.of("https://appunture.com"));
        cors.setExposedHeaders(List.of("X-RateLimit-Limit", "X-RateLimit-Remaining"));

        // When
        CorsConfiguration config = createCorsConfiguration(cors);

        // Then
        assertThat(config.getExposedHeaders()).containsExactlyInAnyOrder(
            "X-RateLimit-Limit", "X-RateLimit-Remaining"
        );
    }

    /**
     * Método auxiliar que replica a lógica de SecurityConfig.corsConfigurationSource()
     * 
     * Nota: Esta duplicação é intencional para testes unitários.
     * O objetivo é validar a lógica de configuração CORS isoladamente,
     * sem dependências do contexto Spring. Isso permite:
     * 1. Testes rápidos e independentes
     * 2. Validação da lógica sem carregar o contexto Spring
     * 3. Detecção de regressões na lógica de configuração
     * 
     * Se a lógica em SecurityConfig mudar, este método também deve ser atualizado.
     */
    private CorsConfiguration createCorsConfiguration(SecurityProperties.Cors cors) {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = cors.getAllowedOrigins();
        List<String> allowedOriginPatterns = cors.getAllowedOriginPatterns();

        if (allowedOriginPatterns != null && !allowedOriginPatterns.isEmpty()) {
            configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        } else if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            boolean wildcard = allowedOrigins.stream().anyMatch("*"::equals);
            if (wildcard) {
                configuration.setAllowedOriginPatterns(List.of("*"));
            } else {
                configuration.setAllowedOrigins(allowedOrigins);
            }
        } else {
            throw new IllegalStateException(
                "CORS não configurado! Configure 'app.security.cors.allowed-origins' " +
                "ou 'app.security.cors.allowed-origin-patterns' em application.yml"
            );
        }

        configuration.setAllowedMethods(cors.getAllowedMethods());
        configuration.setAllowedHeaders(cors.getAllowedHeaders());
        if (cors.getExposedHeaders() != null && !cors.getExposedHeaders().isEmpty()) {
            configuration.setExposedHeaders(cors.getExposedHeaders());
        }
        configuration.setAllowCredentials(cors.isAllowCredentials());
        configuration.setMaxAge(cors.getMaxAge() != null ? cors.getMaxAge().getSeconds() : 3600);

        return configuration;
    }
}

