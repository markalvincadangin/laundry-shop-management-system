package com.himotech.laundryms.rates.service;

import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRateService {
    private final ServiceRateRepository serviceRateRepository;

    @Transactional(readOnly = true)
    public ServiceRate getActiveRate() {
        return serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new NotFoundException("No active service rate found."));
    }

    @Transactional(readOnly = true)
    public List<ServiceRate> findAll(boolean activeOnly) {
        if (activeOnly) {
            return serviceRateRepository.findByIsActiveTrue();
        }
        return serviceRateRepository.findAll();
    }
}
