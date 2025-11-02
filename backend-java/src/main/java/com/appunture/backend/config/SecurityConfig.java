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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // SECURITY WARNING: Never use allowedOrigins("*") in production!
        // Always configure specific domains in application-{profile}.yml
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
            configuration.setAllowedOriginPatterns(List.of("*"));
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
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
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

