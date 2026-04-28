package com.himotech.laundryms.rates.api;

import com.himotech.laundryms.api.dto.request.UpdateServiceRateRequest;
import com.himotech.laundryms.api.dto.response.ServiceRateResponse;
import com.himotech.laundryms.api.mapper.ServiceRateMapper;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.service.ServiceRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-rates")
@RequiredArgsConstructor
public class ServiceRatesController {

    private final ServiceRateService serviceRateService;
    private final ServiceRateMapper serviceRateMapper;

    @GetMapping
    public ResponseEntity<List<ServiceRateResponse>> list(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        List<ServiceRate> rates = serviceRateService.findAll(activeOnly);
        return ResponseEntity.ok(rates.stream().map(serviceRateMapper::toResponse).toList());
    }

    @GetMapping("/active")
    public ResponseEntity<ServiceRateResponse> getActive() {
        ServiceRate rate = serviceRateService.getActiveRate();
        return ResponseEntity.ok(serviceRateMapper.toResponse(rate));
    }

    @PatchMapping("/{rateId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceRateResponse> update(
            @PathVariable Integer rateId,
            @Valid @RequestBody UpdateServiceRateRequest request) {
        ServiceRate rate = serviceRateService.update(rateId, request);
        return ResponseEntity.ok(serviceRateMapper.toResponse(rate));
    }
}