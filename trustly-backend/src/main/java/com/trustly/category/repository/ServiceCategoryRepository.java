package com.trustly.category.repository;

import com.trustly.category.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceCategoryRepository
        extends JpaRepository<ServiceCategory, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<ServiceCategory> findByNameIgnoreCase(String name);

    Optional<ServiceCategory> findByIdAndActiveTrue(Long id);

    List<ServiceCategory> findAllByActiveTrue();
}