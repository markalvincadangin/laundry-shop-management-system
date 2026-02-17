package com.himotech.laundryms.testcontainers;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Abstract base class for all integration tests that require a PostgreSQL database.
 *
 * <p>This class provides:
 * <ul>
 *   <li>A shared PostgreSQL 16 Testcontainer instance (reused across all tests for performance)</li>
 *   <li>Automatic Flyway schema migration (V1__init.sql, V2__seed_users.sql)</li>
 *   <li>Critical PostgreSQL enum fix: ?stringtype=unspecified appended to JDBC URL</li>
 * </ul>
 *
 * <h2>Critical Configuration: PostgreSQL Enum Support</h2>
 * The {@code ?stringtype=unspecified} parameter in the JDBC URL is <b>essential</b> for our schema.
 * Without it, PostgreSQL rejects enum values (user_role, order_status, payment_status, etc.) with:
 * <pre>
 * ERROR: column 'role' is of type user_role but expression is of type character varying
 * </pre>
 *
 * <h2>Seed Data from V1__init.sql</h2>
 * After Flyway runs, the database contains:
 * <ul>
 *   <li><b>service_rates</b>: 1 active rate (ID=1, 'Standard Wash', ₱120/load, 8kg limit)</li>
 * </ul>
 *
 * <h2>Usage</h2>
 * Extend this class to inherit the containerized PostgreSQL setup:
 * <pre>
 * {@code @DisplayName("CustomerRepository Integration Tests")}
 * class CustomerRepositoryIT extends AbstractIntegrationTest {
 *     // Your tests here
 * }
 * </pre>
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class AbstractIntegrationTest {

    /**
     * Shared PostgreSQL container instance.
     * Static + withReuse(true) ensures the container starts once per test run.
     */
    private static final PostgreSQLContainer<?> POSTGRES_CONTAINER;

    static {
        POSTGRES_CONTAINER = new PostgreSQLContainer<>(
                DockerImageName.parse("postgres:16-alpine")
        )
                .withDatabaseName("laundry_db")
                .withUsername("laundry_user")
                .withPassword("laundry_password")
                .withReuse(true);  // Reuse container across test classes

        POSTGRES_CONTAINER.start();
    }

    /**
     * Returns the shared PostgreSQL container instance.
     *
     * This method allows other test configurations (e.g., PostgresTestContainerConfig)
     * to reuse the same container instead of starting multiple containers.
     *
     * @return the shared PostgreSQL container
     */
    public static PostgreSQLContainer<?> getPostgresContainer() {
        return POSTGRES_CONTAINER;
    }

    /**
     * Appends {@code ?stringtype=unspecified} to the JDBC URL.
     *
     * <p>This parameter forces the PostgreSQL driver to send string parameters as
     * unspecified type, allowing PostgreSQL to automatically cast them to custom
     * enum types (user_role, order_status, payment_method, etc.).
     *
     * <p><b>Without this parameter:</b>
     * <pre>
     * PSQLException: ERROR: column "role" is of type user_role but expression is of type character varying
     *   Hint: You will need to rewrite or cast the expression.
     * </pre>
     *
     * <p><b>With this parameter:</b>
     * PostgreSQL successfully casts VARCHAR → custom enum types.
     *
     * @param registry Spring's dynamic property registry
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // CRITICAL: Append &stringtype=unspecified for PostgreSQL enum compatibility
        // Use & because Testcontainers URL already has ?loggerLevel=OFF
        String jdbcUrl = POSTGRES_CONTAINER.getJdbcUrl();
        String jdbcUrlWithEnumFix = jdbcUrl.contains("?")
            ? jdbcUrl + "&stringtype=unspecified"
            : jdbcUrl + "?stringtype=unspecified";

        registry.add("spring.datasource.url", () -> jdbcUrlWithEnumFix);
        registry.add("spring.datasource.username", POSTGRES_CONTAINER::getUsername);
        registry.add("spring.datasource.password", POSTGRES_CONTAINER::getPassword);
    }
}

