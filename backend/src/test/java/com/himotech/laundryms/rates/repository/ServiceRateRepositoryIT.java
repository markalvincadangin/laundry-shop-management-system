package com.himotech.laundryms.rates.repository;

import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Persistence Integration Tests for ServiceRateRepository.
 *
 * <p><b>Seed Data Context:</b>
 * V1__init.sql creates one active ServiceRate:
 * <ul>
 *   <li>ID: 1</li>
 *   <li>Service Name: 'Standard Wash'</li>
 *   <li>Base Price: ₱120.00</li>
 *   <li>KG Limit: 8.00</li>
 *   <li>Extra Minute Price: ₱1.00</li>
 *   <li>Is Active: TRUE</li>
 * </ul>
 *
 * <p>Tests must account for this pre-existing data.
 *
 * @see AbstractIntegrationTest
 */
@DisplayName("ServiceRateRepository Persistence Integration Tests")
class ServiceRateRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ServiceRateRepository serviceRateRepository;

    /**
     * Test 1: findFirstByIsActiveTrueOrderByIdDesc should return the latest active rate.
     *
     * <p><b>Challenge:</b> Database already contains ID=1 ('Standard Wash') from seed data.
     *
     * <p><b>Strategy:</b>
     * Insert additional rates and verify that the query returns the one with the highest ID.
     */
    @Test
    @DisplayName("findFirstByIsActiveTrueOrderByIdDesc - Should return latest active rate (including seed data)")
    void findFirstByIsActiveTrueOrderByIdDesc_ShouldReturnLatestActiveRate() {
        // Given - Database already has seed rate (ID=1, 'Standard Wash', active=true)
        // Insert Rate A (Active=true)
        ServiceRate rateA = ServiceRate.builder()
                .serviceName("Rate A")
                .basePricePerLoad(new BigDecimal("100.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.00"))
                .isActive(true)
                .build();
        rateA = entityManager.persist(rateA);

        // Insert Rate B (Active=false) - should be ignored by query
        ServiceRate rateB = ServiceRate.builder()
                .serviceName("Rate B")
                .basePricePerLoad(new BigDecimal("110.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("1.50"))
                .isActive(false)
                .build();
        rateB = entityManager.persist(rateB);

        // Insert Rate C (Active=true) - this should be returned (latest active by ID)
        ServiceRate rateC = ServiceRate.builder()
                .serviceName("Rate C")
                .basePricePerLoad(new BigDecimal("120.00"))
                .kgLimitPerLoad(new BigDecimal("8.00"))
                .pricePerExtraMinute(new BigDecimal("2.00"))
                .isActive(true)
                .build();
        rateC = entityManager.persist(rateC);

        entityManager.flush();
        entityManager.clear();

        // When
        Optional<ServiceRate> result = serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc();

        // Then - Should return Rate C (highest ID among active rates)
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(rateC.getId());
        assertThat(result.get().getServiceName()).isEqualTo("Rate C");
        assertThat(result.get().getBasePricePerLoad()).isEqualTo(new BigDecimal("120.00"));
        assertThat(result.get().getPricePerExtraMinute()).isEqualTo(new BigDecimal("2.00"));
        assertThat(result.get().getIsActive()).isTrue();
    }

    /**
     * Test 2: Verify empty result when no active rates exist.
     *
     * <p><b>CRITICAL:</b> Must call {@code deleteAll()} first to remove the seed data.
     * Without this, the test will fail because ID=1 ('Standard Wash') exists.
     */
    @Test
    @DisplayName("Should return empty when no active rates exist (after deleting seed data)")
    void shouldReturnEmptyWhenNoActiveRatesExist() {
        // CRITICAL: Remove seed data first
        serviceRateRepository.deleteAll();
        entityManager.flush();
        entityManager.clear();

        // When
        Optional<ServiceRate> result = serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc();

        // Then
        assertThat(result).isEmpty();
    }

    /**
     * Test 3: Verify seed data exists and matches expected values.
     *
     * <p>This test validates that Flyway correctly applied V1__init.sql.
     */
    @Test
    @DisplayName("Should find seed data from V1__init.sql")
    void shouldFindSeedDataFromMigration() {
        // When - Query without inserting any data
        Optional<ServiceRate> result = serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc();

        // Then - Should find the seed rate from V1__init.sql
        assertThat(result).isPresent();
        ServiceRate seedRate = result.get();

        // Verify seed data matches V1__init.sql
        assertThat(seedRate.getServiceName()).isEqualTo("Standard Wash");
        assertThat(seedRate.getBasePricePerLoad()).isEqualTo(new BigDecimal("120.00"));
        assertThat(seedRate.getKgLimitPerLoad()).isEqualTo(new BigDecimal("8.00"));
        assertThat(seedRate.getPricePerExtraMinute()).isEqualTo(new BigDecimal("1.00"));
        assertThat(seedRate.getIsActive()).isTrue();
    }

    /**
     * Test 4: Verify query ignores inactive rates and returns only active ones.
     */
    @Test
    @DisplayName("Should ignore inactive rates and return only active rate")
    void shouldIgnoreInactiveRatesAndReturnOnlyActiveRate() {
        // Given - Insert several inactive rates (higher IDs)
        ServiceRate inactiveRate1 = ServiceRate.builder()
                .serviceName("Inactive Rate 1")
                .basePricePerLoad(new BigDecimal("200.00"))
                .kgLimitPerLoad(new BigDecimal("10.00"))
                .pricePerExtraMinute(new BigDecimal("5.00"))
                .isActive(false)
                .build();
        entityManager.persist(inactiveRate1);

        ServiceRate inactiveRate2 = ServiceRate.builder()
                .serviceName("Inactive Rate 2")
                .basePricePerLoad(new BigDecimal("250.00"))
                .kgLimitPerLoad(new BigDecimal("12.00"))
                .pricePerExtraMinute(new BigDecimal("10.00"))
                .isActive(false)
                .build();
        entityManager.persist(inactiveRate2);

        entityManager.flush();
        entityManager.clear();

        // When
        Optional<ServiceRate> result = serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc();

        // Then - Should still return the seed rate (ID=1, active), not the inactive ones
        assertThat(result).isPresent();
        assertThat(result.get().getServiceName()).isEqualTo("Standard Wash");
        assertThat(result.get().getIsActive()).isTrue();
    }
}



