package com.himotech.laundryms.clientalert;

public interface SmsAdapter {
    /**
     * Sends an SMS message to a specific recipient.
     * @param recipient The phone number (e.g., 09123456789)
     * @param message The text content
     */
    void send(String recipient, String message);
}
