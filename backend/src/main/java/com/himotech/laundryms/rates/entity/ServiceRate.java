package com.himotech.laundryms.rates.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "base_price_per_load", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePricePerLoad;

    @Column(name = "kg_limit_per_load", nullable = false, precision = 5, scale = 2)
    private BigDecimal kgLimitPerLoad;

    @Column(name = "price_per_extra_minute", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerExtraMinute;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}


