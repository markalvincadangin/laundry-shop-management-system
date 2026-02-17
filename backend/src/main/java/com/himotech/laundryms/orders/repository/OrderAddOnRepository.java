package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.orders.entity.OrderAddOn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for OrderAddOn entity.
 * Add-ons are typically managed via Order cascade; this repository supports
 * queries when needed (e.g. findByOrderId).
 */
@Repository
public interface OrderAddOnRepository extends JpaRepository<OrderAddOn, Long> {

    List<OrderAddOn> findByOrderId(Long orderId);
}
