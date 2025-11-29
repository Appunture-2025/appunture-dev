package com.appunture.backend.config;

import com.appunture.backend.security.FirebaseAuthenticationFilter;
import com.appunture.backend.security.RateLimitingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.util.CollectionUtils.isEmpty;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final SecurityProperties securityProperties;

    public SecurityConfig(FirebaseAuthenticationFilter firebaseAuthenticationFilter,
                          RateLimitingFilter rateLimitingFilter,
                          SecurityProperties securityProperties) {
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.securityProperties = securityProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * ⚠️ SEGURANÇA CRÍTICA - CORS CONFIGURATION
     * 
     * NUNCA usar allowedOrigins("*") em produção!
     * Isso permite que qualquer site faça requests à API, abrindo brecha para:
     * - CSRF (Cross-Site Request Forgery)
     * - XSS (Cross-Site Scripting)
     * - Data leakage
     * 
     * Sempre especificar domínios permitidos explicitamente.
     * Em produção, usar apenas HTTPS.
     * 
     * Configuração é feita através de:
     * - application-dev.yml: Para desenvolvimento (localhost patterns)
     * - application-prod.yml: Para produção (domínios específicos HTTPS)
     * 
     * @return CorsConfigurationSource configurado de acordo com o ambiente
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        SecurityProperties.Cors cors = securityProperties.getCors();

        List<String> allowedOrigins = cors.getAllowedOrigins();
        List<String> allowedOriginPatterns = cors.getAllowedOriginPatterns();

        if (!isEmpty(allowedOriginPatterns)) {
            configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        } else if (!isEmpty(allowedOrigins)) {
            boolean wildcard = allowedOrigins.stream().anyMatch("*"::equals);
            if (wildcard) {
                configuration.setAllowedOriginPatterns(List.of("*"));
            } else {
                configuration.setAllowedOrigins(allowedOrigins);
            }
        } else {
            // ⚠️ SEGURANÇA: Se nenhum origin foi configurado, não permitir nenhum!
            // Isso força a configuração explícita em application.yml
            configuration.setAllowedOrigins(List.of());
            throw new IllegalStateException(
                "CORS não configurado! Configure 'app.security.cors.allowed-origins' " +
                "ou 'app.security.cors.allowed-origin-patterns' em application.yml"
            );
        }

        configuration.setAllowedMethods(cors.getAllowedMethods());
        configuration.setAllowedHeaders(cors.getAllowedHeaders());
        if (!isEmpty(cors.getExposedHeaders())) {
            configuration.setExposedHeaders(cors.getExposedHeaders());
        }
        configuration.setAllowCredentials(cors.isAllowCredentials());
        configuration.setMaxAge(cors.getMaxAge() != null ? cors.getMaxAge().getSeconds() : 3600);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disabled: Using stateless JWT/Firebase tokens
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Security Headers
                .headers(headers -> headers
                        .contentTypeOptions(contentType -> {}) // X-Content-Type-Options: nosniff
                        .frameOptions(frame -> frame.deny()) // X-Frame-Options: DENY
                        .xssProtection(xss -> xss.disable()) // X-XSS-Protection: 0 (modern browsers don't need this)
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)) // HSTS: 1 year
                        .referrerPolicy(referrer -> referrer
                                .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(permissions -> permissions
                                .policy("geolocation=(), microphone=(), camera=()"))
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        // Swagger/OpenAPI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        // Endpoints protegidos
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                );

        // Adiciona o filtro de autenticação Firebase
        http.addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(rateLimitingFilter, FirebaseAuthenticationFilter.class);
        
        return http.build();
    }
}
