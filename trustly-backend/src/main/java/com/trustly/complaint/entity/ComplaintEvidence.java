package com.trustly.complaint.entity;

import com.trustly.complaint.enums.ComplaintEvidenceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "complaint_evidences",
        indexes = {
                @Index(
                        name = "idx_complaint_evidence_complaint",
                        columnList = "complaint_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Parent complaint
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "complaint_id",
            nullable = false
    )
    private Complaint complaint;

    /**
     * Cloudinary secure url
     */
    @Column(nullable = false, length = 1000)
    private String fileUrl;

    /**
     * Cloudinary public id
     *
     * Example:
     * trustly/complaints/abc123
     */
    @Column(nullable = false, length = 500)
    private String publicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ComplaintEvidenceType fileType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}