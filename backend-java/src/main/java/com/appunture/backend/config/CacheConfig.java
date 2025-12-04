package com.appunture.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

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
