package com.himotech.laundryms.rates.service;

import com.himotech.laundryms.rates.dto.AddOnCatalogResponse;
import com.himotech.laundryms.rates.dto.CreateAddOnCatalogRequest;
import com.himotech.laundryms.rates.dto.UpdateAddOnCatalogRequest;
import com.himotech.laundryms.rates.entity.AddOnCatalog;
import com.himotech.laundryms.rates.repository.AddOnCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.himotech.laundryms.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class AddOnCatalogService {

    private final AddOnCatalogRepository repository;

    @Transactional(readOnly = true)
    public List<AddOnCatalogResponse> getAllActive() {
        return repository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AddOnCatalogResponse> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddOnCatalogResponse create(CreateAddOnCatalogRequest request) {
        if (repository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Add-on with this name already exists");
        }

        AddOnCatalog addOn = AddOnCatalog.builder()
                .name(request.getName())
                .defaultPrice(request.getDefaultPrice())
                .isActive(true)
                .build();

        return mapToResponse(repository.save(addOn));
    }

    @Transactional
    public AddOnCatalogResponse update(Integer id, UpdateAddOnCatalogRequest request) {
        AddOnCatalog addOn = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Add-on not found"));

        if (request.getName() != null && !request.getName().equals(addOn.getName())) {
            repository.findByNameIgnoreCase(request.getName()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Add-on with this name already exists");
                }
            });
            addOn.setName(request.getName());
        }

        if (request.getDefaultPrice() != null) {
            addOn.setDefaultPrice(request.getDefaultPrice());
        }

        if (request.getIsActive() != null) {
            addOn.setIsActive(request.getIsActive());
        }

        return mapToResponse(repository.save(addOn));
    }

    private AddOnCatalogResponse mapToResponse(AddOnCatalog entity) {
        return AddOnCatalogResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .defaultPrice(entity.getDefaultPrice())
                .isActive(entity.getIsActive())
                .build();
    }
}
