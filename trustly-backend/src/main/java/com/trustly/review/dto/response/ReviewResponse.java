package com.trustly.review.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;

    private Long serviceRequestId;

    private Long customerId;

    private String customerName;

    private Long workerProfileId;

    private Integer rating;

    private String reviewText;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}