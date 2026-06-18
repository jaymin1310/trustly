package com.trustly.complaint.entity;

import com.trustly.complaint.enums.ComplaintCategory;
import com.trustly.complaint.enums.ComplaintStatus;
import com.trustly.servicerequest.entity.ServiceRequest;
import com.trustly.user.entity.User;
import com.trustly.workerprofile.entity.WorkerProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "complaints",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_complaint_customer_service_request",
                        columnNames = {
                                "customer_id",
                                "service_request_id"
                        }
                )
        },
        indexes = {
                @Index(name = "idx_complaint_status", columnList = "status"),
                @Index(name = "idx_complaint_customer", columnList = "customer_id"),
                @Index(name = "idx_complaint_worker_profile", columnList = "worker_profile_id"),
                @Index(name = "idx_complaint_service_request", columnList = "service_request_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Customer who raised complaint
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private User customer;

    /**
     * Worker against whom complaint is raised
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "worker_profile_id",
            nullable = false
    )
    private WorkerProfile workerProfile;

    /**
     * Service request from which complaint originated
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "service_request_id",
            nullable = false
    )
    private ServiceRequest serviceRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ComplaintCategory category;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ComplaintStatus status;

    /**
     * Admin note after review
     */
    @Column(length = 2000)
    private String resolutionNote;

    /**
     * Admin who resolved complaint
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    private LocalDateTime resolvedAt;

    @OneToMany(
            mappedBy = "complaint",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ComplaintEvidence> evidences = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}