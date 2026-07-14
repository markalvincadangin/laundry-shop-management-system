package com.himotech.laundryms.rates.repository;

import com.himotech.laundryms.rates.entity.AddOnCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddOnCatalogRepository extends JpaRepository<AddOnCatalog, Integer> {
    List<AddOnCatalog> findByIsActiveTrueOrderByNameAsc();
    Optional<AddOnCatalog> findByNameIgnoreCase(String name);
}
