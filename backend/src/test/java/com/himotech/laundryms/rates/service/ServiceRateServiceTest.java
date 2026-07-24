package com.himotech.laundryms.rates.service;

import java.util.UUID;

import com.himotech.laundryms.shared.exception.NotFoundException;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import com.himotech.laundryms.support.TestDataBuilders;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;
import com.himotech.laundryms.rates.dto.UpdateServiceRateRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ServiceRateService.
 * Covers: Active rate retrieval.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ServiceRateService Unit Tests")
class ServiceRateServiceTest {

    @Mock
    private ServiceRateRepository serviceRateRepository;

    @InjectMocks
    private ServiceRateService serviceRateService;

    @Nested
    @DisplayName("getActiveRate")
    class GetActiveRate {

        @Test
        @DisplayName("Should return active rate when exists")
        void getActiveRateShouldreturnWhenactiveexists() {
            // Given
            ServiceRate rate = TestDataBuilders.serviceRate().build();
            when(serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc()).thenReturn(Optional.of(rate));

            // When
            ServiceRate result = serviceRateService.getActiveRate();

            // Then
            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(rate);
            assertThat(result.getBasePricePerLoad()).isEqualByComparingTo("140.00");  // BR-PR-01
            assertThat(result.getKgLimitPerLoad()).isEqualByComparingTo("8.00");
            verify(serviceRateRepository).findFirstByIsActiveTrueOrderByIdDesc();
        }

        @Test
        @DisplayName("Should throw NotFoundException when no active rate")
        void getActiveRateShouldthrowWhennoactiverate() {
            when(serviceRateRepository.findFirstByIsActiveTrueOrderByIdDesc()).thenReturn(Optional.empty());

            assertThatThrownBy(() -> serviceRateService.getActiveRate())
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("No active service rate found");
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("Should prevent deactivating last active service rate")
        void updateShouldpreventdeactivatinglastactiverate() {
            // Given
            UUID id = UUID.randomUUID();
            ServiceRate rate = TestDataBuilders.serviceRate().id(id).isActive(true).build();
            when(serviceRateRepository.findById(id)).thenReturn(Optional.of(rate));
            when(serviceRateRepository.findByIsActiveTrue()).thenReturn(List.of(rate)); // only 1 active rate

            UpdateServiceRateRequest request = new UpdateServiceRateRequest();
            request.setIsActive(false);

            // When / Then
            assertThatThrownBy(() -> serviceRateService.update(id, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot deactivate the last active service rate");
        }
    }
}
