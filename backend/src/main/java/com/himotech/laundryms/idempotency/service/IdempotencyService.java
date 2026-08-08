package com.himotech.laundryms.idempotency.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.idempotency.entity.OperationRecovery;
import com.himotech.laundryms.idempotency.repository.OperationRecoveryRepository;
import com.himotech.laundryms.shared.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final OperationRecoveryRepository repository;
    private final ObjectMapper objectMapper;

    /**
     * Executes an operation with idempotency protection.
     * If the operation was already completed for the given identifier, actor, and action type,
     * it returns the cached response.
     * If the operation is pending, it throws a ConflictException.
     * If the operation identifier was used for a different actor or action type, it throws a ConflictException.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public <T> T executeWithIdempotency(String operationIdentifier, UUID actorId, String actionType, Class<T> responseType, Supplier<T> operation) {
        if (operationIdentifier == null || operationIdentifier.isBlank()) {
            return operation.get();
        }

        Optional<OperationRecovery> existingOpt = repository.findById(operationIdentifier);

        if (existingOpt.isPresent()) {
            OperationRecovery existing = existingOpt.get();
            if (!existing.getActorId().equals(actorId) || !existing.getActionType().equals(actionType)) {
                throw new ConflictException("Operation identifier already used for a different action or user.");
            }
            if (existing.getStatus() == OperationRecovery.OperationStatus.PENDING) {
                throw new ConflictException("Operation is already in progress.");
            }
            if (existing.getStatus() == OperationRecovery.OperationStatus.COMPLETED) {
                try {
                    return objectMapper.readValue(existing.getResponseBody(), responseType);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to parse cached response", e);
                }
            }
        }

        // Reserve the operation
        OperationRecovery recovery = OperationRecovery.builder()
                .operationIdentifier(operationIdentifier)
                .actorId(actorId)
                .actionType(actionType)
                .status(OperationRecovery.OperationStatus.PENDING)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();
        repository.saveAndFlush(recovery);

        try {
            T result = operation.get();
            recovery.setStatus(OperationRecovery.OperationStatus.COMPLETED);
            try {
                recovery.setResponseBody(objectMapper.writeValueAsString(result));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize response", e);
            }
            // Assuming HTTP 200 for simplicity in the service layer; controllers can map this properly.
            recovery.setResponseStatus(200);
            repository.save(recovery);
            return result;
        } catch (Exception e) {
            recovery.setStatus(OperationRecovery.OperationStatus.FAILED);
            // If it failed due to a business exception, we still record it so we don't retry non-retryable errors
            // but for system errors we might want to allow retry. We'll mark as FAILED for now.
            repository.save(recovery);
            throw e;
        }
    }
}
