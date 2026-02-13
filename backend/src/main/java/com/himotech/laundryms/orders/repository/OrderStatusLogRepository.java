package com.himotech.laundryms.orders.repository;

import com.himotech.laundryms.orders.entity.OrderStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderStatusLogRepository extends JpaRepository<OrderStatusLog, Long> {
}
