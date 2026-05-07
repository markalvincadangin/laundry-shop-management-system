package com.himotech.laundryms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * FlywayConfig — Customizes Flyway migration behavior.
 * Provides a strategy to clean the database on startup if a specific property
 * is set.
 */
@Configuration
@Slf4j
public class FlywayConfig {

    @Value("${spring.flyway.clean-on-startup:false}")
    private boolean cleanOnStartup;

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            if (cleanOnStartup) {
                log.warn("DATABASE CLEAN-ON-STARTUP IS ENABLED! Wiping all data...");
                try {
                    flyway.clean();
                    log.info("Database cleaned successfully.");
                } catch (Exception e) {
                    log.error("Failed to clean database. Check if 'spring.flyway.clean-disabled' is set to false.", e);
                    throw e;
                }
            }
            log.info("Running database migrations...");
            flyway.migrate();
        };
    }
}
