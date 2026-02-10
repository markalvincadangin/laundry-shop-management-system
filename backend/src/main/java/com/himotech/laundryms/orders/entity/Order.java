package com.himotech.laundryms.orders.entity;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"addOns", "statusLogs"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_rate_id", nullable = false)
    private ServiceRate serviceRate;

    @Column(name = "weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "total_loads", nullable = false)
    private Integer totalLoads;

    // Snapshot of pricing rules at order creation (from erd.dbml and V1__init.sql)
    @Column(name = "base_price_per_load", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePricePerLoad;

    @Column(name = "kg_limit_per_load", nullable = false, precision = 5, scale = 2)
    private BigDecimal kgLimitPerLoad;

    @Column(name = "price_per_extra_minute", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerExtraMinute;

    @Column(name = "extra_minutes", nullable = false)
    private Integer extraMinutes;

    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "extra_minutes_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal extraMinutesAmount;

    @Column(name = "addons_total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal addonsTotalAmount;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private OrderStatus currentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderAddOn> addOns = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusLog> statusLogs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

