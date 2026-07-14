package com.himotech.laundryms.sync.worker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.sync.entity.OutboxEvent;
import com.himotech.laundryms.sync.entity.SyncStatus;
import com.himotech.laundryms.sync.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncWorker {

    private final OutboxEventRepository outboxEventRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${app.cloud-api-url:https://api.faithlaundry.com/sync}")
    private String cloudApiUrl;
    
    @Value("${app.sync-secret:}")
    private String syncSecret;

    @Scheduled(fixedDelayString = "${app.sync-interval-ms:5000}")
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50BySyncStatusOrderByCreatedAtAsc(SyncStatus.PENDING);

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox events to sync.", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                syncEvent(event);
                event.setSyncStatus(SyncStatus.COMPLETED);
                outboxEventRepository.save(event);
                log.info("Successfully synced event: {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to sync event {}: {}", event.getId(), e.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setSyncStatus(SyncStatus.FAILED);
                }
                outboxEventRepository.save(event);
            }
        }
    }

    private void syncEvent(OutboxEvent event) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + syncSecret); // In production, generate HMAC or proper JWT

        HttpEntity<String> request = new HttpEntity<>(event.getPayload(), headers);
        
        // Push payload to Cloud API - expects a 2xx response for success
        restTemplate.postForEntity(cloudApiUrl + "/" + event.getAggregateType().toLowerCase(), request, String.class);
    }
}
