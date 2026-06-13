package com.trustly.review.service.impl;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.exception.BadRequestException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.exception.UnauthorizedException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.review.dto.request.CreateReviewRequest;
import com.trustly.review.dto.request.UpdateReviewRequest;
import com.trustly.review.dto.response.ReviewResponse;
import com.trustly.review.entity.Review;
import com.trustly.review.repository.ReviewRepository;
import com.trustly.review.service.ReviewService;
import com.trustly.servicerequest.entity.ServiceRequest;
import com.trustly.servicerequest.repository.ServiceRequestRepository;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import com.trustly.workerprofile.entity.WorkerProfile;
import com.trustly.workerprofile.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {

        String email = SecurityUtils.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        ServiceRequest serviceRequest = serviceRequestRepository
                .findById(request.getServiceRequestId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service request not found"));

        if (!serviceRequest.getCustomer().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                    "You can only review your own service requests"
            );
        }

        if (serviceRequest.getStatus() != ServiceRequestStatus.COMPLETED) {
            throw new BadRequestException(
                    "Review can only be submitted for completed service requests"
            );
        }

        if (reviewRepository.existsByServiceRequestId(serviceRequest.getId())) {
            throw new BadRequestException(
                    "Review already exists for this service request"
            );
        }

        Review review = Review.builder()
                .serviceRequest(serviceRequest)
                .customer(currentUser)
                .workerProfile(serviceRequest.getWorkerProfile())
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .build();

        review = reviewRepository.save(review);

        recalculateWorkerRating(
                serviceRequest.getWorkerProfile().getId()
        );

        return mapToResponse(review);
    }

    @Override
    public ReviewResponse updateReview(
            Long reviewId,
            UpdateReviewRequest request
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                    "You can update only your own reviews"
            );
        }

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        review = reviewRepository.save(review);

        recalculateWorkerRating(
                review.getWorkerProfile().getId()
        );

        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getWorkerReviews(
            Long workerProfileId,
            Pageable pageable
    ) {

        if (!workerProfileRepository.existsById(workerProfileId)) {
            throw new ResourceNotFoundException(
                    "Worker profile not found"
            );
        }

        return reviewRepository
                .findByWorkerProfileIdOrderByCreatedAtDesc(
                        workerProfileId,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewByServiceRequestId(
            Long serviceRequestId
    ) {

        Review review = reviewRepository
                .findByServiceRequestId(serviceRequestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        return mapToResponse(review);
    }

    private void recalculateWorkerRating(Long workerProfileId) {

        WorkerProfile workerProfile = workerProfileRepository
                .findById(workerProfileId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Worker profile not found"
                        ));

        long totalReviews =
                reviewRepository.countByWorkerProfileId(workerProfileId);

        Double averageRating =
                reviewRepository.findAverageRatingByWorkerProfileId(
                        workerProfileId
                );

        workerProfile.setTotalReviews((int) totalReviews);

        BigDecimal avg = BigDecimal.valueOf(
                averageRating == null ? 0.0 : averageRating
        ).setScale(2, RoundingMode.HALF_UP);

        workerProfile.setAverageRating(avg);

        workerProfileRepository.save(workerProfile);
    }

    private ReviewResponse mapToResponse(Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .serviceRequestId(review.getServiceRequest().getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getName())
                .workerProfileId(review.getWorkerProfile().getId())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }@Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviewsForWorker(
            Long workerProfileId
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return reviewRepository
                .findByCustomerIdAndWorkerProfileIdOrderByCreatedAtDesc(
                        currentUser.getId(),
                        workerProfileId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

}