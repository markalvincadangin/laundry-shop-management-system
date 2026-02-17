package com.himotech.laundryms.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Stub SMS adapter that logs messages instead of sending.
 * Placeholder for future SMS provider integration.
 */
@Slf4j
@Component
@Primary
public class SmsAdapterStub implements SmsAdapter {

    @Override
    public void send(String contactNumber, String message) {
        log.info("[SMS STUB] Would send to {}: {}", contactNumber, message);
    }
}
