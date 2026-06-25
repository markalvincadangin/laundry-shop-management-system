package com.himotech.laundryms.config;

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

    public static final String CACHE_USERNAMES = "usernames";
    public static final String CACHE_SERVICE_RATES = "serviceRates";
    public static final String CACHE_CUSTOMERS = "customers";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_USERNAMES, 
                CACHE_SERVICE_RATES, 
                CACHE_CUSTOMERS
        );
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }

    @SuppressWarnings("unchecked")
    Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(500)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats();
    }
}
