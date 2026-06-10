package com.trustly.workerprofile.repository;
import com.trustly.workerprofile.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkerProfileRepository
        extends JpaRepository<WorkerProfile, Long> {

    Optional<WorkerProfile> findByWorkerId(Long workerId);

    boolean existsByWorkerId(Long workerId);
}