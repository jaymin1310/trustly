package com.trustly.review.controller;

import com.trustly.review.dto.request.CreateReviewRequest;
import com.trustly.review.dto.request.UpdateReviewRequest;
import com.trustly.review.dto.response.ReviewResponse;
import com.trustly.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponse createReview(
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return reviewService.createReview(request);
    }

    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        return reviewService.updateReview(
                reviewId,
                request
        );
    }

    @GetMapping("/worker/{workerProfileId}")
    public Page<ReviewResponse> getWorkerReviews(
            @PathVariable Long workerProfileId,
            Pageable pageable
    ) {
        return reviewService.getWorkerReviews(
                workerProfileId,
                pageable
        );
    }

    @GetMapping("/service-request/{serviceRequestId}")
    public ReviewResponse getReviewByServiceRequestId(
            @PathVariable Long serviceRequestId
    ) {
        return reviewService.getReviewByServiceRequestId(
                serviceRequestId
        );
    }
    @GetMapping("/worker/{workerProfileId}/my-reviews")
    public List<ReviewResponse> getMyReviewsForWorker(
            @PathVariable Long workerProfileId
    ) {
        return reviewService.getMyReviewsForWorker(
                workerProfileId
        );
    }
}