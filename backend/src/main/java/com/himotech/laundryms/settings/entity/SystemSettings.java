package com.himotech.laundryms.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    private Long id = 1L; // Locked to 1

    @Column(name = "is_system_paused", nullable = false)
    private boolean isSystemPaused = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
