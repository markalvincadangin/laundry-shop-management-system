package com.himotech.laundryms.idempotency.repository;

import com.himotech.laundryms.idempotency.entity.OperationRecovery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface OperationRecoveryRepository extends JpaRepository<OperationRecovery, String> {
    void deleteByExpiresAtBefore(OffsetDateTime now);
}
