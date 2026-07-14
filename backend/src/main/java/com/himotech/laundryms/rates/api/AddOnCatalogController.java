package com.himotech.laundryms.rates.api;

import com.himotech.laundryms.rates.dto.AddOnCatalogResponse;
import com.himotech.laundryms.rates.dto.CreateAddOnCatalogRequest;
import com.himotech.laundryms.rates.dto.UpdateAddOnCatalogRequest;
import com.himotech.laundryms.rates.service.AddOnCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/add-ons")
@RequiredArgsConstructor
public class AddOnCatalogController {

    private final AddOnCatalogService service;

    @GetMapping
    public List<AddOnCatalogResponse> getAll(@RequestParam(defaultValue = "true") boolean activeOnly) {
        if (activeOnly) {
            return service.getAllActive();
        }
        return service.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AddOnCatalogResponse create(@Valid @RequestBody CreateAddOnCatalogRequest request) {
        return service.create(request);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AddOnCatalogResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAddOnCatalogRequest request) {
        return service.update(id, request);
    }
}
