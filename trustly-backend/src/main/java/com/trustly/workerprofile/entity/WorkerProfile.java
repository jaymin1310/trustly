package com.trustly.workerprofile.entity;

import com.trustly.category.entity.ServiceCategory;
import com.trustly.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "worker_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_worker_profile_worker",
                        columnNames = "worker_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "worker_id",
            nullable = false,
            unique = true
    )
    private User worker;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ServiceCategory category;
    @Column(length = 500)
    private String bio;

    @Column(nullable = false)
    private Integer experienceYears;

    private String city;

    private String state;

    @Builder.Default
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal averageRating = new BigDecimal("0.00");
    @Builder.Default
    @Column(nullable = false)
    private Integer totalReviews = 0;
    @Builder.Default
    @Column(nullable = false)
    private Boolean profileCompleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}