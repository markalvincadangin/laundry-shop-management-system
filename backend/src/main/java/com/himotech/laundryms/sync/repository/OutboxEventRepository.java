package com.himotech.laundryms.sync.repository;

import com.himotech.laundryms.sync.entity.OutboxEvent;
import com.himotech.laundryms.sync.entity.SyncStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop50BySyncStatusOrderByCreatedAtAsc(SyncStatus syncStatus);
}
