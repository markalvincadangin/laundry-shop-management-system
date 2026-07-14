package com.himotech.laundryms.machines.repository;

import com.himotech.laundryms.machines.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findAllByIsActiveTrueOrderByNameAsc();
}
