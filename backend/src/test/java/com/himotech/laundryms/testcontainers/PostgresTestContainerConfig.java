package com.himotech.laundryms.testcontainers;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Testcontainers configuration for PostgreSQL integration tests.
 *
 * This configuration uses Spring Boot 3.1+ @ServiceConnection to automatically:
 * - Start a PostgreSQL 16 container with credentials matching the development environment
 * - Map container connection properties to Spring's datasource configuration
 * - Ensure Flyway can authenticate successfully
 * - Configure stringtype=unspecified for PostgreSQL custom enum compatibility
 *
 * Credentials configured:
 * - Database: laundry_db
 * - Username: laundry_user
 * - Password: laundry_password
 *
 * The @ServiceConnection annotation automatically configures:
 * - spring.datasource.url (with stringtype=unspecified parameter)
 * - spring.datasource.username
 * - spring.datasource.password
 * - spring.datasource.driver-class-name
 */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresTestContainerConfig {

    private static final PostgreSQLContainer<?> postgres;

    static {
        postgres = new PostgreSQLContainer<>(
                DockerImageName.parse("postgres:16-alpine")
        )
                .withDatabaseName("laundry_db")
                .withUsername("laundry_user")
                .withPassword("laundry_password")
                .withReuse(true);  // Reuse container across test classes for performance

        // Start container and log connection details
        postgres.start();

        System.out.println("=== PostgreSQL Testcontainer Started (@ServiceConnection) ===");
        System.out.println("JDBC URL: " + postgres.getJdbcUrl());
        System.out.println("Username: " + postgres.getUsername());
        System.out.println("Database: " + postgres.getDatabaseName());
        System.out.println("Container ID: " + postgres.getContainerId());
        System.out.println("Driver: " + postgres.getDriverClassName());
        System.out.println("Note: stringtype=unspecified will be appended by @DynamicPropertySource");
        System.out.println("============================================================");
    }

    /**
     * Returns the shared PostgreSQL container instance.
     *
     * The @ServiceConnection annotation (Spring Boot 3.1+) automatically configures Spring Boot's
     * DataSource properties based on the container's connection details.
     *
     * @return configured PostgreSQL container
     */
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return postgres;
    }

    /**
     * Configures JDBC URL with stringtype=unspecified parameter.
     *
     * This is CRITICAL for PostgreSQL custom enum types (user_role, order_status, etc.).
     * Without this parameter, PostgreSQL rejects enum values sent as VARCHAR, causing:
     * "ERROR: column 'role' is of type user_role but expression is of type character varying"
     *
     * The ?stringtype=unspecified parameter forces the PostgreSQL driver to send strings
     * as unspecified type, allowing PostgreSQL to automatically cast them to the correct
     * enum type.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Override the JDBC URL to append stringtype=unspecified
        // Use & because Testcontainers URL already has ?loggerLevel=OFF
        String jdbcUrl = postgres.getJdbcUrl();
        String jdbcUrlWithEnumFix = jdbcUrl.contains("?")
            ? jdbcUrl + "&stringtype=unspecified"
            : jdbcUrl + "?stringtype=unspecified";

        registry.add("spring.datasource.url", () -> jdbcUrlWithEnumFix);

        System.out.println("=== @DynamicPropertySource: Enum Fix Applied ===");
        System.out.println("Original URL: " + jdbcUrl);
        System.out.println("Modified URL: " + jdbcUrlWithEnumFix);
        System.out.println("================================================");
    }
}