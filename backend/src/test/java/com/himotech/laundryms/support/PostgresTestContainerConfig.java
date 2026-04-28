package com.himotech.laundryms.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Testcontainers configuration for PostgreSQL integration tests.
 *
 * This configuration reuses the shared PostgreSQL container from {@link AbstractIntegrationTest}
 * to avoid starting multiple containers and wasting Docker resources.
 *
 * The @ServiceConnection annotation (Spring Boot 3.1+) automatically configures:
 * - spring.datasource.url (with stringtype=unspecified parameter via @DynamicPropertySource)
 * - spring.datasource.username
 * - spring.datasource.password
 * - spring.datasource.driver-class-name
 *
 * Note: The stringtype=unspecified parameter is appended via @DynamicPropertySource
 * in AbstractIntegrationTest to ensure PostgreSQL custom enum compatibility.
 */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresTestContainerConfig {

    /**
     * Returns the shared PostgreSQL container instance from AbstractIntegrationTest.
     *
     * This approach ensures only one container is started for the entire test suite,
     * improving performance and reducing Docker resource usage.
     *
     * The @ServiceConnection annotation (Spring Boot 3.1+) automatically configures Spring Boot's
     * DataSource properties based on the container's connection details.
     *
     * @return the shared PostgreSQL container
     */
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return AbstractIntegrationTest.getPostgresContainer();
    }
}
