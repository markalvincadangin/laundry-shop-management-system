package com.himotech.laundryms.auth;

import com.himotech.laundryms.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Scheduled job to prune expired refresh tokens.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    // Run every day at 3:00 AM
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void pruneExpiredTokens() {
        log.info("Starting scheduled cleanup of expired refresh tokens...");
        Instant now = Instant.now();
        try {
            refreshTokenRepository.deleteExpiredTokens(now);
            log.info("Finished scheduled cleanup of expired refresh tokens.");
        } catch (Exception e) {
            log.error("Error occurred during scheduled cleanup of expired refresh tokens", e);
        }
    }
}
