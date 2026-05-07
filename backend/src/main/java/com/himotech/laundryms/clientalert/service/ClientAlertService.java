package com.himotech.laundryms.clientalert.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.clientalert.api.ClientAlertResponse;
import com.himotech.laundryms.clientalert.api.ClientAlertMapper;
import com.himotech.laundryms.common.enums.ClientAlertStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.clientalert.entity.ClientAlert;
import com.himotech.laundryms.clientalert.repository.ClientAlertRepository;
import com.himotech.laundryms.clientalert.SmsAdapter;
import com.himotech.laundryms.orders.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Unified Client Alert Service.
 * Handles both customer communication logs and proactive alert generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClientAlertService {

    @Value("${app.sms.template}")
    private String messageTemplate;

    private final ClientAlertRepository clientAlertRepository;
    private final ClientAlertMapper clientAlertMapper;
    private final SmsAdapter smsAdapter;

    /**
     * Searches client alerts for the registry.
     * Uses ClientAlertSpecification for dynamic criteria-based filtering.
     */
    @Transactional(readOnly = true)
    public Page<ClientAlertResponse> search(String q, ClientAlertStatus status, Instant from, Instant to, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<ClientAlert> spec = 
            com.himotech.laundryms.clientalert.repository.ClientAlertSpecification.filterBy(
                q, 
                status, 
                from, 
                to
            );
            
        Page<ClientAlert> alerts = clientAlertRepository.findAll(spec, pageable);
        return alerts.map(clientAlertMapper::toResponse);
    }

    /**
     * Creates a client alert record when an order reaches READY_FOR_PICKUP.
     * Triggers SMS delivery via SmsAdapter.
     */
    @Transactional
    public ClientAlert createForReadyForPickup(Order order) {
        Customer customer = order.getCustomer();
        String message = String.format(messageTemplate, 
                customer.getFirstName(), 
                order.getReferenceNumber(), 
                order.getGrandTotal());

        ClientAlert alert = ClientAlert.builder()
                .order(order)
                .message(message)
                .status(ClientAlertStatus.PENDING)
                .build();
        ClientAlert saved = clientAlertRepository.save(alert);

        log.info("Client Alert created: id={}, orderRef={}, customerId={}", 
                saved.getId(), order.getReferenceNumber(), customer.getId());

        try {
            smsAdapter.send(customer.getContactNumber(), message);
            saved.setStatus(ClientAlertStatus.SENT);
            saved.setSentAt(Instant.now());
            clientAlertRepository.save(saved);
        } catch (Exception e) {
            log.warn("SMS delivery failed for client alert {}: {}", saved.getId(), e.getMessage());
            saved.setStatus(ClientAlertStatus.FAILED);
            clientAlertRepository.save(saved);
        }

        return saved;
    }

    /**
     * Marks a specific alert as read.
     */
    @Auditable(action = "CLIENT_ALERT_READ", description = "Mark client alert as read")
    @Transactional
    public void markAsRead(Long id) {
        clientAlertRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            clientAlertRepository.save(n);
        });
    }

    /**
     * Marks all unread alerts as read.
     */
    @Auditable(action = "CLIENT_ALERT_READ_ALL", description = "Mark all client alerts as read")
    @Transactional
    public void markAllAsRead() {
        clientAlertRepository.findAllByIsReadFalse().forEach(n -> {
            n.setRead(true);
            clientAlertRepository.save(n);
        });
    }
}
