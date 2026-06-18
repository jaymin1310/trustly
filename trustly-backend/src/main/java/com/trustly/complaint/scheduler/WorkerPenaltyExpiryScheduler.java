package com.trustly.complaint.scheduler;

import com.trustly.complaint.entity.WorkerPenalty;
import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.complaint.repository.WorkerPenaltyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkerPenaltyExpiryScheduler {

    private final WorkerPenaltyRepository workerPenaltyRepository;

    @Scheduled(cron = "0 */10 * * * *")
    public void expireTemporarySuspensions() {

        log.info("Starting worker penalty expiry");

        List<WorkerPenalty> expiredSuspensions =
                workerPenaltyRepository.findByStatusAndActionAndEndAtBefore(
                        PenaltyStatus.ACTIVE,
                        PenaltyAction.TEMP_SUSPENSION,
                        LocalDateTime.now()
                );

        expiredSuspensions.forEach(penalty ->
                penalty.setStatus(PenaltyStatus.EXPIRED)
        );

        workerPenaltyRepository.saveAll(expiredSuspensions);

        log.info(
                "Worker penalty expiry completed. Expired suspensions: {}",
                expiredSuspensions.size()
        );
    }
}
