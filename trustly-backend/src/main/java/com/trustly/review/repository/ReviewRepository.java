package com.trustly.review.repository;

import com.trustly.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByServiceRequestId(Long serviceRequestId);

    Optional<Review> findByServiceRequestId(Long serviceRequestId);

    Page<Review> findByWorkerProfileIdOrderByCreatedAtDesc(Long workerProfileId, Pageable pageable);

    Page<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId,Pageable pageable);

    long countByWorkerProfileId(Long workerProfileId);

    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM Review r
            WHERE r.workerProfile.id = :workerProfileId
            """)
    Double findAverageRatingByWorkerProfileId(Long workerProfileId);
    List<Review> findByCustomerIdAndWorkerProfileIdOrderByCreatedAtDesc(
            Long customerId,
            Long workerProfileId
    );

}