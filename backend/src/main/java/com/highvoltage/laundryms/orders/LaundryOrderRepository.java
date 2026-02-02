package com.highvoltage.laundryms.orders;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LaundryOrderRepository extends JpaRepository<LaundryOrder, Long> {
    Optional<LaundryOrder> findByOrderReferenceNumber(String orderReferenceNumber);
    boolean existsByOrderReferenceNumber(String orderReferenceNumber);
}
