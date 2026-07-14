package com.himotech.laundryms.rates.entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "service_rates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ServiceRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "service_name", length = 100)
    private String serviceName;

    @Column(name = "base_price_per_load", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePricePerLoad;

    @Column(name = "kg_limit_per_load", nullable = false, precision = 5, scale = 2)
    private BigDecimal kgLimitPerLoad;

    @Column(name = "price_per_extra_minute", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerExtraMinute;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}


