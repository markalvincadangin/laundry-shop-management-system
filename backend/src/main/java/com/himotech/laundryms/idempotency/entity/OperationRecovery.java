package com.himotech.laundryms.idempotency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "operation_recovery")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationRecovery {

    @Id
    @Column(name = "operation_identifier", nullable = false)
    private String operationIdentifier;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private OperationStatus status;

    @Column(name = "response_body")
    private String responseBody;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    public enum OperationStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
