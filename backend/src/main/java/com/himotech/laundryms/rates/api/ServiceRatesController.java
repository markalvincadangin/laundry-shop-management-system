package com.himotech.laundryms.rates.api;

import com.himotech.laundryms.api.dto.response.ServiceRateResponse;
import com.himotech.laundryms.api.mapper.ServiceRateMapper;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import com.himotech.laundryms.rates.service.ServiceRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-rates")
@RequiredArgsConstructor
public class ServiceRatesController {

    private final ServiceRateRepository serviceRateRepository;
    private final ServiceRateService serviceRateService;
    private final ServiceRateMapper serviceRateMapper;

    @GetMapping
    public ResponseEntity<List<ServiceRateResponse>> list(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        List<ServiceRate> rates = activeOnly
                ? serviceRateRepository.findAll().stream().filter(ServiceRate::getIsActive).toList()
                : serviceRateRepository.findAll();
        return ResponseEntity.ok(rates.stream().map(serviceRateMapper::toResponse).toList());
    }

    @GetMapping("/active")
    public ResponseEntity<ServiceRateResponse> getActive() {
        ServiceRate rate = serviceRateService.getActiveRate();
        return ResponseEntity.ok(serviceRateMapper.toResponse(rate));
    }
}