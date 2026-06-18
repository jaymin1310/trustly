package com.trustly.complaint.repository;

import com.trustly.complaint.entity.WorkerPenalty;
import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkerPenaltyRepository
        extends JpaRepository<WorkerPenalty, Long> {

    List<WorkerPenalty> findByWorkerProfileId(
            Long workerProfileId
    );

    List<WorkerPenalty> findByWorkerProfileIdAndStatus(
            Long workerProfileId,
            PenaltyStatus status
    );

    boolean existsByWorkerProfileIdAndStatus(
            Long workerProfileId,
            PenaltyStatus status
    );

    long countByStatus(
            PenaltyStatus status
    );

    List<WorkerPenalty> findByStatusAndActionAndEndAtBefore(
            PenaltyStatus status,
            PenaltyAction action,
            LocalDateTime endAt
    );
}
