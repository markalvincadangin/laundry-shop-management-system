package com.himotech.laundryms.sync.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.sync.entity.OutboxEvent;
import com.himotech.laundryms.sync.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public void publishEvent(String aggregateType, UUID aggregateId, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .payload(jsonPayload)
                    .build();
            outboxEventRepository.save(event);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payload for aggregate {} id {}", aggregateType, aggregateId, e);
            throw new RuntimeException("Serialization error during outbox event creation", e);
        }
    }
}
