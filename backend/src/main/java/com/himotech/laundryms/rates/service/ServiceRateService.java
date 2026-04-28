package com.himotech.laundryms.rates.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.api.dto.request.UpdateServiceRateRequest;
import com.himotech.laundryms.config.CacheConfig;
import com.himotech.laundryms.exception.NotFoundException;
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
    public ServiceRate findById(Integer id) {
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

    @Auditable(action = "RATE_UPDATE", description = "Update service rate pricing")
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_SERVICE_RATES, allEntries = true)
    public ServiceRate update(Integer id, UpdateServiceRateRequest request) {
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
            rate.setIsActive(request.getIsActive());
        }
        return serviceRateRepository.save(rate);
    }
}
