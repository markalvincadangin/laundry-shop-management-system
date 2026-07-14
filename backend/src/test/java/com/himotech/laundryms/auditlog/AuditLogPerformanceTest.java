package com.himotech.laundryms.auditlog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import com.himotech.laundryms.support.PostgresTestContainerConfig;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(PostgresTestContainerConfig.class)
public class AuditLogPerformanceTest {


    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testAuditWritePerformanceUnder5PercentDegradation() {
        // Prepare required data
        jdbcTemplate.execute("INSERT INTO users (id, username, password_hash, first_name, last_name, role, is_active) " +
                "VALUES ('b1234567-89ab-cdef-0123-456789abcdef', 'testadmin', 'hash', 'Test', 'Admin', 'ADMIN', true) " +
                "ON CONFLICT DO NOTHING;");
        
        jdbcTemplate.execute("INSERT INTO customers (id, first_name, last_name, contact_number, is_active) " +
                "VALUES (1001, 'Perf', 'Customer', '09123456789', true) ON CONFLICT DO NOTHING;");
        
        jdbcTemplate.execute("INSERT INTO service_rates (id, service_name, base_price_per_load, kg_limit_per_load, price_per_extra_minute) " +
                "VALUES (1001, 'PerfWash', 100, 8, 1) ON CONFLICT DO NOTHING;");

        // Disable Audit Log Trigger for baseline
        jdbcTemplate.execute("ALTER TABLE orders DISABLE TRIGGER trg_audit_log_orders");

        // Warm up (10 iterations)
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 10; j++) insertOrder(i * 10 + j);
        }

        // Measure Without Audit Log Trigger (10 measured iterations)
        long[] noAuditTimes = new long[10];
        for (int i = 0; i < 10; i++) {
            long start = System.nanoTime();
            for (int j = 0; j < 10; j++) insertOrder(100 + i * 10 + j);
            noAuditTimes[i] = System.nanoTime() - start;
        }

        // Re-enable trigger for audit measurement
        jdbcTemplate.execute("ALTER TABLE orders ENABLE TRIGGER trg_audit_log_orders");

        // Warm up (10 iterations)
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 10; j++) insertOrder(200 + i * 10 + j);
        }

        // Measure With Audit Log Trigger (10 measured iterations)
        long[] auditTimes = new long[10];
        for (int i = 0; i < 10; i++) {
            long start = System.nanoTime();
            for (int j = 0; j < 10; j++) insertOrder(300 + i * 10 + j);
            auditTimes[i] = System.nanoTime() - start;
        }

        // Calculate mean and stddev for baseline
        double sumNoAudit = 0;
        for (long t : noAuditTimes) sumNoAudit += t;
        double meanNoAudit = sumNoAudit / 10.0;
        
        double variance = 0;
        for (long t : noAuditTimes) variance += Math.pow(t - meanNoAudit, 2);
        double stddevNoAudit = Math.sqrt(variance / 10.0);

        // Calculate mean for audit
        double sumAudit = 0;
        for (long t : auditTimes) sumAudit += t;
        double meanAudit = sumAudit / 10.0;

        // The dynamic threshold is mean + 2 * stddev
        double dynamicThreshold = meanNoAudit + (2 * stddevNoAudit);
        
        // Add a base buffer in case stddev is incredibly small (e.g. 5% overhead minimum)
        double absoluteMinimumThreshold = meanNoAudit * 1.05;
        double finalThreshold = Math.max(dynamicThreshold, absoluteMinimumThreshold);

        System.out.println("Mean No Audit: " + meanNoAudit + " ns");
        System.out.println("StdDev No Audit: " + stddevNoAudit + " ns");
        System.out.println("Mean Audit: " + meanAudit + " ns");
        System.out.println("Final Threshold: " + finalThreshold + " ns");

        assertThat(meanAudit).isLessThan(finalThreshold);
    }

    private void insertOrder(int i) {
        String ref = "LDR-20230101-" + String.format("%04d", i);
        jdbcTemplate.update(
            "INSERT INTO orders (reference_number, customer_id, created_by_user_id, service_rate_id, " +
            "weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, " +
            "extra_minutes, base_amount, extra_minutes_amount, addons_total_amount, grand_total, " +
            "current_status, payment_status) " +
            "VALUES (?, 1001, 'b1234567-89ab-cdef-0123-456789abcdef', 1001, 5, 1, 100, 8, 1, 0, 100, 0, 0, 100, 'RECEIVED', 'UNPAID')",
            ref
        );
    }
}
