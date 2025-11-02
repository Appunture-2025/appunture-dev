package com.appunture.backend.security;

import com.appunture.backend.config.SecurityProperties;
import com.appunture.backend.security.FirebaseAuthenticationFilter.FirebaseAuthDetails;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final SecurityProperties securityProperties;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private Bandwidth bandwidth;

    @PostConstruct
    void initBucketConfiguration() {
        SecurityProperties.RateLimit rateLimit = securityProperties.getRateLimit();
        if (!rateLimit.isEnabled()) {
            return;
        }

        Duration refillDuration = Optional.ofNullable(rateLimit.getRefillDuration())
                .filter(d -> !d.isNegative() && !d.isZero())
                .orElse(Duration.ofMinutes(1));

    Refill refill = Refill.intervally(rateLimit.getRefillTokens(), refillDuration);
    this.bandwidth = Bandwidth.classic(rateLimit.getCapacity(), refill);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        SecurityProperties.RateLimit rateLimit = securityProperties.getRateLimit();
        if (!rateLimit.isEnabled()) {
            return true;
        }

        String path = request.getRequestURI();
        if (!StringUtils.hasText(path)) {
            return false;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        return rateLimit.getExcludedPaths().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        SecurityProperties.RateLimit rateLimit = securityProperties.getRateLimit();
        if (!rateLimit.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

    Bucket bucket = buckets.computeIfAbsent(resolveKey(request, rateLimit.getStrategy()), key ->
        Bucket.builder().addLimit(bandwidth).build());

        if (bucket.tryConsume(1)) {
            long available = bucket.getAvailableTokens();
            response.setHeader("X-RateLimit-Limit", Integer.toString(rateLimit.getCapacity()));
            response.setHeader("X-RateLimit-Remaining", Long.toString(available));
            filterChain.doFilter(request, response);
            return;
        }

        long nanosToNextRefill = bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill();
        long retryAfterSeconds = nanosToNextRefill > 0 ? Duration.ofNanos(nanosToNextRefill).toSeconds() : 1;

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", Long.toString(Math.max(1, retryAfterSeconds)));
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"rate_limit_exceeded\",\"message\":\"Too many requests. Please retry later.\"}");
        log.debug("Rate limit exceeded for key {}", resolveKey(request, rateLimit.getStrategy()));
    }

    private String resolveKey(HttpServletRequest request, SecurityProperties.Strategy strategy) {
        if (strategy == SecurityProperties.Strategy.PER_IP) {
            return getRemoteAddress(request);
        }

        if (strategy == SecurityProperties.Strategy.PER_USER) {
            return resolveUserKey().orElseGet(() -> getRemoteAddress(request));
        }

        // AUTO strategy: prefer authenticated user, fallback to IP
        return resolveUserKey().orElseGet(() -> getRemoteAddress(request));
    }

    private Optional<String> resolveUserKey() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(auth -> {
                    Object details = auth.getDetails();
                    if (details instanceof FirebaseAuthDetails authDetails) {
                        return authDetails.getUid();
                    }
                    return null;
                })
                .filter(Objects::nonNull);
    }

    private String getRemoteAddress(HttpServletRequest request) {
        String forwardedHeader = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedHeader)) {
            return forwardedHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
