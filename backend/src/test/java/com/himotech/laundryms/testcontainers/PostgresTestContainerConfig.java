package com.himotech.laundryms.testcontainers;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@TestConfiguration
public class PostgresTestContainerConfig {

    // Singleton PostgreSQL container that will be reused across all tests
    public static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("laundry_test_db")
                    .withUsername("laundry_user")
                    .withPassword("test_password_123");

    static {
        POSTGRES.start();
    }
}