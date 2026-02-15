package com.himotech.laundryms.notification;

/**
 * Adapter for sending SMS notifications.
 * Stub implementation logs the message instead of sending (Phase 10).
 */
public interface SmsAdapter {

    /**
     * Sends an SMS to the given contact number.
     * Stub: logs the message instead of sending.
     *
     * @param contactNumber recipient phone number
     * @param message       message content
     */
    void send(String contactNumber, String message);
}
