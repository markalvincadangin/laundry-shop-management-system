package com.himotech.laundryms.notification.api;

import com.himotech.laundryms.api.dto.response.NotificationResponse;
import com.himotech.laundryms.api.mapper.NotificationMapper;
import com.himotech.laundryms.notification.entity.Notification;
import com.himotech.laundryms.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API for notification list (staff view).
 * Supports US-10, BR-NOTIF-01.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list() {
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(notifications.stream()
                .map(notificationMapper::toResponse)
                .toList());
    }
}
