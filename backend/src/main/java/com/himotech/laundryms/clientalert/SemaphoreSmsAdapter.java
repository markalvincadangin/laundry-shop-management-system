package com.himotech.laundryms.clientalert;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

/**
 * Implementation for Semaphore.co SMS Gateway.
 */
@Slf4j
@Component
@Primary
public class SemaphoreSmsAdapter implements SmsAdapter {

    private static final String API_URL = "https://api.semaphore.co/api/v4/messages";

    @Value("${app.sms.semaphore.api-key:}")
    private String apiKey;

    @Value("${app.sms.semaphore.sender-name:Semaphore}")
    private String senderName;

    private final RestTemplate restTemplate;

    public SemaphoreSmsAdapter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void send(String recipient, String message) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Semaphore API Key is missing. SMS not sent to {}.", recipient);
            return;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("apikey", apiKey)
                    .queryParam("number", recipient)
                    .queryParam("message", message)
                    .queryParam("sendername", senderName)
                    .toUriString();

            log.debug("Sending SMS via Semaphore to {}: {}", recipient, message);
            
            // Semaphore expects a POST request, but the parameters can be in the query string
            restTemplate.postForEntity(url, null, String.class);
            
            log.info("SMS successfully sent to {} via Semaphore.", recipient);
        } catch (Exception e) {
            log.error("Failed to send SMS to {} via Semaphore: {}", recipient, e.getMessage());
            throw new RuntimeException("SMS delivery failed", e);
        }
    }
}
