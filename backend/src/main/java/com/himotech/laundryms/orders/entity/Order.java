package com.himotech.laundryms.orders.entity;

import java.util.UUID;

import com.himotech.laundryms.orders.OrderStatus;
import com.himotech.laundryms.payments.PaymentStatus;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import com.himotech.laundryms.machines.entity.Machine;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"addOns"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 30)
    private String trackingNumber;

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
    @Column(name = "current_status", nullable = false, length = 30)
    private OrderStatus currentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "is_rush", nullable = false)
    @Builder.Default
    private Boolean isRush = false;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderAddOn> addOns = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "order_machines",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "machine_id")
    )
    @Builder.Default
    private Set<Machine> assignedMachines = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

