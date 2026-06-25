package com.himotech.laundryms.rates.repository;

import com.himotech.laundryms.rates.entity.ServiceRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ServiceRate entity.
 * Provides database access for service rate pricing rules.
 */
@Repository
public interface ServiceRateRepository extends JpaRepository<ServiceRate, Integer> {

    /**
     * Finds the currently active service rate, defaulting to the latest one.
     * This is critical for fetching the active pricing rule when creating orders.
     *
     * Query breakdown:
     * - Filters by isActive = true
     * - Orders by id descending (latest first)
     * - Returns the first match
     *
     * @return an Optional containing the active service rate if found, empty otherwise
     */
    Optional<ServiceRate> findFirstByIsActiveTrueOrderByIdDesc();

    /**
     * Finds all active service rates.
     *
     * @return a list of all active service rates
     */
    List<ServiceRate> findByIsActiveTrue();

    /**
     * Finds a service rate by its unique name.
     *
     * @param serviceName the name of the service
     * @return an Optional containing the service rate if found
     */
    Optional<ServiceRate> findByServiceName(String serviceName);
}

