package com.himotech.laundryms.notification;

import com.himotech.laundryms.common.enums.NotificationStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.notification.entity.Notification;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for creating and managing notifications.
 * BR-NOTIF-01: Trigger notification when status → READY_FOR_PICKUP.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final String MESSAGE_TEMPLATE = "Your laundry order %s is ready for pickup. Please collect at the shop.";

    private final NotificationRepository notificationRepository;
    private final SmsAdapter smsAdapter;

    /**
     * Creates a notification record when an order reaches READY_FOR_PICKUP.
     * Message includes order reference number per BR-NOTIF-01.
     */
    @Transactional
    public Notification createForReadyForPickup(Order order) {
        Customer customer = order.getCustomer();
        String message = String.format(MESSAGE_TEMPLATE, order.getReferenceNumber());

        Notification notification = Notification.builder()
                .order(order)
                .customer(customer)
                .message(message)
                .status(NotificationStatus.PENDING)
                .build();
        Notification saved = notificationRepository.save(notification);

        log.info("Notification created: id={}, orderRef={}, customerId={}", 
                saved.getId(), order.getReferenceNumber(), customer.getId());

        try {
            smsAdapter.send(customer.getContactNumber(), message);
            saved.setStatus(NotificationStatus.SENT);
            saved.setSentAt(java.time.LocalDateTime.now());
            notificationRepository.save(saved);
        } catch (Exception e) {
            log.warn("SMS delivery failed for notification {}: {}", saved.getId(), e.getMessage());
            saved.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(saved);
        }

        return saved;
    }
}
