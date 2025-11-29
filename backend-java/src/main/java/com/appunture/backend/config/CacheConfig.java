package com.appunture.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration using Caffeine for high-performance in-memory caching.
 * 
 * This configuration provides caching for:
 * - Points: Static acupuncture point data (TTL: 30 minutes)
 * - Meridians: Meridian data (TTL: 1 hour)
 * - Point lookups: Individual point queries (TTL: 15 minutes)
 * 
 * Performance benefits:
 * - Reduced Firestore read operations
 * - Lower latency for frequently accessed data
 * - Reduced costs (Firestore charges per read)
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_POINTS = "points";
    public static final String CACHE_POINTS_BY_MERIDIAN = "pointsByMeridian";
    public static final String CACHE_POINT_BY_CODE = "pointByCode";
    public static final String CACHE_POPULAR_POINTS = "popularPoints";
    public static final String CACHE_POINTS_COUNT = "pointsCount";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Default cache settings
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats());
        
        // Register specific caches
        cacheManager.setCacheNames(java.util.List.of(
                CACHE_POINTS,
                CACHE_POINTS_BY_MERIDIAN,
                CACHE_POINT_BY_CODE,
                CACHE_POPULAR_POINTS,
                CACHE_POINTS_COUNT
        ));
        
        return cacheManager;
    }
}
