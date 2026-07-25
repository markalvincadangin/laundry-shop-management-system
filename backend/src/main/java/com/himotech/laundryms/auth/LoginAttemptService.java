package com.himotech.laundryms.auth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to track login attempts and enforce brute-force lockouts.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;
    private static final int LOCKOUT_MINUTES = 15;

    // In a distributed production system, this should be backed by Redis or similar.
    // For this single-node monolith, a ConcurrentHashMap suffices as per the requirements.
    private final Map<String, AttemptData> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String username) {
        attempts.remove(username);
    }

    public void loginFailed(String username) {
        Instant now = Instant.now();
        AttemptData data = attempts.computeIfAbsent(username, k -> new AttemptData(0, now, null));

        // If already locked and expired, reset
        if (data.getLockedUntil() != null && data.getLockedUntil().isBefore(now)) {
            data.setAttemptCount(1);
            data.setFirstFailedAt(now);
            data.setLockedUntil(null);
            return;
        }

        // If locked and not expired, do nothing (keep it locked)
        if (data.getLockedUntil() != null) {
            return;
        }

        // Otherwise increment
        data.setAttemptCount(data.getAttemptCount() + 1);

        if (data.getAttemptCount() >= MAX_ATTEMPT) {
            data.setLockedUntil(now.plus(LOCKOUT_MINUTES, ChronoUnit.MINUTES));
        }
    }

    public boolean isBlocked(String username) {
        AttemptData data = attempts.get(username);
        if (data == null || data.getLockedUntil() == null) {
            return false;
        }
        
        if (data.getLockedUntil().isBefore(Instant.now())) {
            // Lockout expired
            attempts.remove(username);
            return false;
        }
        
        return true;
    }

    static class AttemptData {
        private int attemptCount;
        private Instant firstFailedAt;
        private Instant lockedUntil;

        public AttemptData(int attemptCount, Instant firstFailedAt, Instant lockedUntil) {
            this.attemptCount = attemptCount;
            this.firstFailedAt = firstFailedAt;
            this.lockedUntil = lockedUntil;
        }

        public int getAttemptCount() {
            return attemptCount;
        }

        public void setAttemptCount(int attemptCount) {
            this.attemptCount = attemptCount;
        }

        public Instant getFirstFailedAt() {
            return firstFailedAt;
        }

        public void setFirstFailedAt(Instant firstFailedAt) {
            this.firstFailedAt = firstFailedAt;
        }

        public Instant getLockedUntil() {
            return lockedUntil;
        }

        public void setLockedUntil(Instant lockedUntil) {
            this.lockedUntil = lockedUntil;
        }
    }
}
