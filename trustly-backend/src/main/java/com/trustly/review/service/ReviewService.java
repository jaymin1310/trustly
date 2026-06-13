package com.trustly.review.service;

import com.trustly.review.dto.request.CreateReviewRequest;
import com.trustly.review.dto.request.UpdateReviewRequest;
import com.trustly.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse updateReview(
            Long reviewId,
            UpdateReviewRequest request
    );

    Page<ReviewResponse> getWorkerReviews(
            Long workerProfileId,
            Pageable pageable
    );

    ReviewResponse getReviewByServiceRequestId(
            Long serviceRequestId
    );
    List<ReviewResponse> getMyReviewsForWorker(
            Long workerProfileId
    );
}