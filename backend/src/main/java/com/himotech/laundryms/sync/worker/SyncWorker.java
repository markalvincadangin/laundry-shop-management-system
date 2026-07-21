package com.himotech.laundryms.sync.worker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.himotech.laundryms.config.SyncProperties;
import com.himotech.laundryms.sync.entity.OutboxEvent;
import com.himotech.laundryms.sync.entity.SyncStatus;
import com.himotech.laundryms.sync.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncWorker {

    private final OutboxEventRepository outboxEventRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    private final SyncProperties syncProperties;

    @Scheduled(fixedDelayString = "${app.sync-interval-ms:5000}")
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50BySyncStatusOrderByCreatedAtAsc(SyncStatus.PENDING);

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox events to sync.", pendingEvents.size());
        Instant now = Instant.now();

        for (OutboxEvent event : pendingEvents) {
            // Exponential backoff
            if (event.getRetryCount() > 0 && event.getUpdatedAt() != null) {
                long backoffSeconds = (long) Math.pow(2, event.getRetryCount());
                Instant nextRetryTime = event.getUpdatedAt().plus(backoffSeconds, ChronoUnit.SECONDS);
                if (now.isBefore(nextRetryTime)) {
                    log.debug("Skipping event {} due to exponential backoff (retry {})", event.getId(), event.getRetryCount());
                    continue;
                }
            }

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
        long EXPIRATION_MS = 60 * 1000; // 1 minute expiration for sync token
        javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
            syncProperties.getSyncSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        String token = io.jsonwebtoken.Jwts.builder()
                .subject("sync-worker")
                .issuedAt(new java.util.Date())
                .expiration(new java.util.Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();

        headers.set("Authorization", "Bearer " + token);
        HttpEntity<String> request = new HttpEntity<>(event.getPayload(), headers);
        
        restTemplate.postForEntity(syncProperties.getCloudApiUrl() + "/" + event.getAggregateType().toLowerCase(), request, String.class);
    }
}
