package com.himotech.laundryms.sync;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.himotech.laundryms.config.SyncProperties;
import com.himotech.laundryms.sync.entity.OutboxEvent;
import com.himotech.laundryms.sync.entity.SyncStatus;
import com.himotech.laundryms.sync.repository.OutboxEventRepository;
import com.himotech.laundryms.sync.worker.SyncWorker;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Testcontainers
class SyncWorkerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:15-alpine"));

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("app.sync.cloud-api-url", () -> "http://localhost:8089/sync");
        registry.add("app.sync.sync-secret", () -> "test-secret");
        registry.add("app.sync.sync-interval-ms", () -> "5000");
    }

    private WireMockServer wireMockServer;

    @Autowired
    private SyncWorker syncWorker;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @BeforeEach
    void setUp() {
        outboxEventRepository.deleteAll();
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        WireMock.configureFor("localhost", 8089);
    }

    @AfterEach
    void tearDown() {
        wireMockServer.stop();
    }

    @Test
    void shouldSuccessfullySyncEvent() {
        // Arrange
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(UUID.randomUUID())
                .payload("{\"status\": \"CREATED\"}")
                .syncStatus(SyncStatus.PENDING)
                .build());

        stubFor(post(urlEqualTo("/sync/order"))
                .withHeader("Authorization", equalTo("Bearer test-secret"))
                .willReturn(aResponse().withStatus(200)));

        // Act
        syncWorker.processOutboxEvents();

        // Assert
        OutboxEvent updated = outboxEventRepository.findById(event.getId()).orElseThrow();
        assertThat(updated.getSyncStatus()).isEqualTo(SyncStatus.COMPLETED);
        
        verify(1, postRequestedFor(urlEqualTo("/sync/order")));
    }

    @Test
    void shouldIncrementRetryCountOnFailure() {
        // Arrange
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(UUID.randomUUID())
                .payload("{\"status\": \"CREATED\"}")
                .syncStatus(SyncStatus.PENDING)
                .retryCount(0)
                .build());

        stubFor(post(urlEqualTo("/sync/order"))
                .willReturn(aResponse().withStatus(500)));

        // Act
        syncWorker.processOutboxEvents();

        // Assert
        OutboxEvent updated = outboxEventRepository.findById(event.getId()).orElseThrow();
        assertThat(updated.getSyncStatus()).isEqualTo(SyncStatus.PENDING);
        assertThat(updated.getRetryCount()).isEqualTo(1);
    }

    @Test
    void shouldMarkAsFailedAfterMaxRetries() {
        // Arrange
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(UUID.randomUUID())
                .payload("{\"status\": \"CREATED\"}")
                .syncStatus(SyncStatus.PENDING)
                .retryCount(4)
                .updatedAt(Instant.now().minus(1, ChronoUnit.DAYS)) // Bypass backoff
                .build());

        stubFor(post(urlEqualTo("/sync/order"))
                .willReturn(aResponse().withStatus(500)));

        // Act
        syncWorker.processOutboxEvents();

        // Assert
        OutboxEvent updated = outboxEventRepository.findById(event.getId()).orElseThrow();
        assertThat(updated.getSyncStatus()).isEqualTo(SyncStatus.FAILED);
        assertThat(updated.getRetryCount()).isEqualTo(5);
    }
}
