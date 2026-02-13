package com.himotech.laundryms.rates.service;

import com.himotech.laundryms.exception.NotFoundException;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServiceRateService {
    private final ServiceRateRepository serviceRateRepository;

    @Transactional(readOnly = true)
    public ServiceRate getActiveRate() {
        return serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new NotFoundException("No active service rate found."));
    }
}
