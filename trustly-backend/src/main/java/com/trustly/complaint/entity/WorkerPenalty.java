package com.trustly.complaint.entity;

import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.user.entity.User;
import com.trustly.workerprofile.entity.WorkerProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "worker_penalties",
        indexes = {
                @Index(
                        name = "idx_worker_penalty_worker",
                        columnList = "worker_profile_id"
                ),
                @Index(
                        name = "idx_worker_penalty_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerPenalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Worker receiving penalty
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "worker_profile_id",
            nullable = false
    )
    private WorkerProfile workerProfile;

    /**
     * Complaint that caused penalty
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "complaint_id",
            nullable = false
    )
    private Complaint complaint;

    /**
     * Admin who issued penalty
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "admin_id",
            nullable = false
    )
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PenaltyAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PenaltyStatus status;

    /**
     * Admin explanation
     */
    @Column(nullable = false, length = 2000)
    private String reason;

    /**
     * Used only for TEMP_SUSPENSION
     */
    private LocalDateTime startAt;

    /**
     * Used only for TEMP_SUSPENSION
     */
    private LocalDateTime endAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}