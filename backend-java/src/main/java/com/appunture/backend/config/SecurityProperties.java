package com.appunture.backend.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private boolean requireEmailVerified = false;

    private Cors cors = new Cors();

    private RateLimit rateLimit = new RateLimit();

    public boolean isCorsConfigured() {
        return cors != null && (!CollectionUtils.isEmpty(cors.getAllowedOrigins())
                || !CollectionUtils.isEmpty(cors.getAllowedOriginPatterns()));
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(Collections.singletonList("*"));
        private List<String> allowedOriginPatterns = new ArrayList<>();
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = new ArrayList<>(Collections.singletonList("*"));
        private List<String> exposedHeaders = new ArrayList<>();
        private boolean allowCredentials = true;
        private Duration maxAge = Duration.ofHours(1);
        private List<String> allowPublicEndpoints = List.of(
                "/api/public/**",
                "/api/health/**",
                "/actuator/**"
        );
    }

    @Getter
    @Setter
    public static class RateLimit {
        private boolean enabled = true;
        @Min(1)
        private int capacity = 200;
        @Min(1)
        private int refillTokens = 200;
        private Duration refillDuration = Duration.ofMinutes(1);
        @Min(1)
        private int maxRetries = 5;
        private Strategy strategy = Strategy.AUTO;
        private List<String> excludedPaths = List.of(
                "/api/health/**",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/actuator/health"
        );
    }

    public enum Strategy {
        AUTO,
        PER_IP,
        PER_USER
    }
}
