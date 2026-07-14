package com.himotech.laundryms.rates.service;

import com.himotech.laundryms.rates.dto.CreateAddOnCatalogRequest;
import com.himotech.laundryms.rates.dto.UpdateAddOnCatalogRequest;
import com.himotech.laundryms.rates.entity.AddOnCatalog;
import com.himotech.laundryms.rates.repository.AddOnCatalogRepository;
import com.himotech.laundryms.shared.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddOnCatalogServiceTest {

    @Mock
    private AddOnCatalogRepository repository;

    @InjectMocks
    private AddOnCatalogService service;

    @Test
    @DisplayName("Should return all active add-ons")
    void getAllActiveAddOns() {
        AddOnCatalog addon = AddOnCatalog.builder()
                .name("Test Addon")
                .defaultPrice(new BigDecimal("10.00"))
                .isActive(true)
                .build();
        when(repository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(addon));

        var result = service.getAllActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Addon");
    }

    @Test
    @DisplayName("Should return all add-ons")
    void getAllAddOns() {
        AddOnCatalog addon = AddOnCatalog.builder()
                .name("Test Addon")
                .defaultPrice(new BigDecimal("10.00"))
                .isActive(true)
                .build();
        when(repository.findAll()).thenReturn(List.of(addon));

        var result = service.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Addon");
    }

    @Test
    @DisplayName("Should create add-on")
    void createAddOn() {
        CreateAddOnCatalogRequest request = new CreateAddOnCatalogRequest();
        request.setName("New Addon");
        request.setDefaultPrice(new BigDecimal("20.00"));

        when(repository.save(any(AddOnCatalog.class))).thenAnswer(inv -> inv.getArgument(0));

        var result = service.create(request);

        assertThat(result.getName()).isEqualTo("New Addon");
        assertThat(result.getDefaultPrice()).isEqualTo(new BigDecimal("20.00"));
        assertThat(result.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should update add-on")
    void updateAddOn() {
        AddOnCatalog existing = AddOnCatalog.builder()
                .name("Old Name")
                .defaultPrice(new BigDecimal("10.00"))
                .isActive(true)
                .build();
        when(repository.findById(1)).thenReturn(Optional.of(existing));
        when(repository.save(any(AddOnCatalog.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateAddOnCatalogRequest request = new UpdateAddOnCatalogRequest();
        request.setName("New Name");
        request.setDefaultPrice(new BigDecimal("15.00"));
        request.setIsActive(false);

        var result = service.update(1, request);

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getDefaultPrice()).isEqualTo(new BigDecimal("15.00"));
        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("Should throw NotFoundException if update target doesn't exist")
    void updateAddOn_NotFound() {
        when(repository.findById(1)).thenReturn(Optional.empty());
        UpdateAddOnCatalogRequest request = new UpdateAddOnCatalogRequest();
        request.setName("New Name");
        request.setDefaultPrice(new BigDecimal("15.00"));
        request.setIsActive(false);

        assertThatThrownBy(() -> service.update(1, request))
                .isInstanceOf(NotFoundException.class);
    }
}
