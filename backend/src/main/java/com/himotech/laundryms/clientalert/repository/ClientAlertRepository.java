package com.himotech.laundryms.clientalert.repository;

import com.himotech.laundryms.clientalert.entity.ClientAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ClientAlertRepository extends JpaRepository<ClientAlert, Long> {

    @EntityGraph(attributePaths = {"order", "order.customer"})
    @Query("SELECT n FROM ClientAlert n ORDER BY n.createdAt DESC")
    List<ClientAlert> findAllByOrderByCreatedAtDesc();

    List<ClientAlert> findAllByIsReadFalse();

    @EntityGraph(attributePaths = {"order", "order.customer"})
    @Query("SELECT n FROM ClientAlert n WHERE " +
           "(CAST(:q AS text) IS NULL OR :q = '' OR LOWER(n.message) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(n.order.referenceNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(n.order.customer.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(n.order.customer.lastName) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(CAST(:status AS text) IS NULL OR :status = '' OR n.status = :status) AND " +
           "(CAST(:from AS timestamp) IS NULL OR n.createdAt >= :from) AND " +
           "(CAST(:to AS timestamp) IS NULL OR n.createdAt <= :to)")
    Page<ClientAlert> search(
            @Param("q") String q,
            @Param("status") String status,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);
}
