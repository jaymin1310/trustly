package com.trustly.workerprofile.repository;
import com.trustly.workerprofile.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface WorkerProfileRepository
        extends JpaRepository<WorkerProfile, Long>,
        JpaSpecificationExecutor<WorkerProfile> {

    Optional<WorkerProfile> findByWorkerId(Long workerId);

    boolean existsByWorkerId(Long workerId);
}
