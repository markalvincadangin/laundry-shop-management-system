package com.himotech.laundryms.clientalert;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub SMS adapter that logs messages instead of sending.
 * Placeholder for future SMS provider integration.
 */
@Slf4j
@Component
public class SmsAdapterStub implements SmsAdapter {

    @Override
    public void send(String recipient, String message) {
        log.info("[SMS STUB] Sending to {}: {}", recipient, message);
    }
}
