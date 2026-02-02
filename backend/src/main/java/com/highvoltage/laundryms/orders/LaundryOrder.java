package com.highvoltage.laundryms.orders;

import com.highvoltage.laundryms.customers.Customer;
import com.highvoltage.laundryms.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "laundry_orders",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_orders_reference", columnNames = "order_reference_number")
        }
)
public class LaundryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_customer"))
    private Customer customer;

    // fk_order_user FOREIGN KEY (created_by) REFERENCES users(id)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_user"))
    private User createdBy;

    @Column(name = "order_reference_number", nullable = false, length = 30)
    private String orderReferenceNumber;

    // NOTE: SQL only says VARCHAR(20) NOT NULL; don't guess enum values.
    @Column(name = "service_type", nullable = false, length = 20)
    private String serviceType;

    @Column(name = "weight", nullable = false, precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "special_items")
    private String specialItems;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "order_status", nullable = false, length = 20)
    private String orderStatus;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus;

    @Column(name = "date_received", nullable = false)
    private LocalDateTime dateReceived;

    @Column(name = "date_released")
    private LocalDateTime dateReleased;

    @PrePersist
    void prePersist() {
        // SQL default is CURRENT_TIMESTAMP; this keeps behavior consistent even if JPA inserts null.
        if (dateReceived == null) {
            dateReceived = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LaundryOrder other)) return false;
        return id != null && Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }
}
