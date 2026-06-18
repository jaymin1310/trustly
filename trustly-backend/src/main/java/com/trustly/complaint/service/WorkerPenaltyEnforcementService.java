package com.trustly.complaint.service;

import com.trustly.common.exception.BadRequestException;
import com.trustly.complaint.entity.WorkerPenalty;
import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.complaint.repository.WorkerPenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerPenaltyEnforcementService {

    private final WorkerPenaltyRepository workerPenaltyRepository;

    public void validateWorkerCanOperate(
            Long workerProfileId
    ) {

        List<WorkerPenalty> activePenalties =
                workerPenaltyRepository.findByWorkerProfileIdAndStatus(
                        workerProfileId,
                        PenaltyStatus.ACTIVE
                );

        LocalDateTime now =
                LocalDateTime.now();

        for (WorkerPenalty penalty : activePenalties) {

            if (penalty.getAction() == PenaltyAction.PERMANENT_BAN) {
                throw new BadRequestException(
                        "Worker is permanently banned"
                );
            }

            if (penalty.getAction() == PenaltyAction.TEMP_SUSPENSION
                    && penalty.getEndAt() != null
                    && penalty.getEndAt().isAfter(now)) {

                throw new BadRequestException(
                        "Worker is temporarily suspended"
                );
            }
        }
    }
}
