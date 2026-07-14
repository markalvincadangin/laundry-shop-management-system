package com.himotech.laundryms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * FlywayConfig — Customizes Flyway migration behavior.
 *
 * <p>Strategy: repair (fix any checksum mismatches) then migrate.
 * Database resets are done externally (Neon dashboard for prod,
 * {@code docker compose down -v} for dev) — never via flyway.clean().
 */
@Configuration
@Slf4j
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // repair() removed to preserve migration immutability guarantees.
            // Use manual repair or dev-only properties if checksum updates are needed.
            flyway.migrate();
            log.info("Flyway migrations completed successfully.");
        };
    }
}
