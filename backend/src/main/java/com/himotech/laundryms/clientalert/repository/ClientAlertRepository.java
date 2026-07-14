package com.himotech.laundryms.clientalert.repository;

import java.util.UUID;

import com.himotech.laundryms.clientalert.entity.ClientAlert;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientAlertRepository extends JpaRepository<ClientAlert, UUID>, JpaSpecificationExecutor<ClientAlert> {

       @EntityGraph(attributePaths = { "order", "order.customer" })
       @Query("SELECT n FROM ClientAlert n ORDER BY n.createdAt DESC")
       List<ClientAlert> findAllByOrderByCreatedAtDesc();

       List<ClientAlert> findAllByIsReadFalse();
}
