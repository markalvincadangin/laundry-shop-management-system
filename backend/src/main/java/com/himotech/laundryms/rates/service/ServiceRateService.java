package com.himotech.laundryms.rates.service;

import java.util.UUID;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.rates.dto.CreateServiceRateRequest;
import com.himotech.laundryms.rates.dto.UpdateServiceRateRequest;
import com.himotech.laundryms.config.CacheConfig;
import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRateService {
    private final ServiceRateRepository serviceRateRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_SERVICE_RATES, key = "'active'")
    public ServiceRate getActiveRate() {
        return serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new NotFoundException("No active service rate found."));
    }

    @Transactional(readOnly = true)
    public ServiceRate getByName(String name) {
        return serviceRateRepository.findByServiceName(name)
                .orElseGet(this::getActiveRate); // Fallback to standard if specific not found
    }

    @Transactional(readOnly = true)
    public ServiceRate findById(UUID id) {
        return serviceRateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service rate not found: " + id));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_SERVICE_RATES, key = "#activeOnly")
    public List<ServiceRate> findAll(boolean activeOnly) {
        if (activeOnly) {
            return serviceRateRepository.findByIsActiveTrue();
        }
        return serviceRateRepository.findAll();
    }

    @Auditable(action = "RATE_CREATE", description = "Create new service rate")
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_SERVICE_RATES, allEntries = true)
    public ServiceRate create(CreateServiceRateRequest request) {
        if (serviceRateRepository.findByServiceName(request.getServiceName()).isPresent()) {
            throw new IllegalArgumentException("Service rate with name already exists: " + request.getServiceName());
        }

        ServiceRate rate = ServiceRate.builder()
                .serviceName(request.getServiceName())
                .basePricePerLoad(request.getBasePricePerLoad())
                .kgLimitPerLoad(request.getKgLimitPerLoad())
                .pricePerExtraMinute(request.getPricePerExtraMinute())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return serviceRateRepository.save(rate);
    }

    @Auditable(action = "RATE_UPDATE", description = "Update service rate pricing")
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_SERVICE_RATES, allEntries = true)
    public ServiceRate update(UUID id, UpdateServiceRateRequest request) {
        ServiceRate rate = findById(id);
        if (request.getServiceName() != null) {
            rate.setServiceName(request.getServiceName());
        }
        if (request.getBasePricePerLoad() != null) {
            rate.setBasePricePerLoad(request.getBasePricePerLoad());
        }
        if (request.getKgLimitPerLoad() != null) {
            rate.setKgLimitPerLoad(request.getKgLimitPerLoad());
        }
        if (request.getPricePerExtraMinute() != null) {
            rate.setPricePerExtraMinute(request.getPricePerExtraMinute());
        }
        if (request.getIsActive() != null) {
            if (!request.getIsActive() && rate.getIsActive()) {
                // We are attempting to deactivate an active rate
                long activeCount = serviceRateRepository.findByIsActiveTrue().size();
                if (activeCount <= 1) {
                    throw new IllegalStateException("Cannot deactivate the last active service rate.");
                }
            }
            rate.setIsActive(request.getIsActive());
        }
        return serviceRateRepository.save(rate);
    }
}
