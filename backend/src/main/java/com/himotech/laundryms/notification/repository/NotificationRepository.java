package com.himotech.laundryms.notification.repository;

import com.himotech.laundryms.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Notification entity.
 * Provides database access for notification-related operations.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}

