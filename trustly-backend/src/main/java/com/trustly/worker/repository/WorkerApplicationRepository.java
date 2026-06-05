package com.trustly.worker.repository;

import com.trustly.common.enums.WorkerApplicationStatus;
import com.trustly.worker.entity.WorkerApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkerApplicationRepository extends JpaRepository<WorkerApplication,Long> {
    Page<WorkerApplication> findByStatus(
            WorkerApplicationStatus status,
            Pageable pageable
    );

    Optional<WorkerApplication> findTopByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    boolean existsByUserIdAndStatus(
            Long userId,
            WorkerApplicationStatus status
    );
}
