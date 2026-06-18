package com.trustly.workerprofile.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class WorkerSearchResponse {

    private Long id;

    private Long workerId;

    private String workerName;

    private Long categoryId;

    private String categoryName;

    private String bio;

    private Integer experienceYears;

    private String city;

    private String state;

    private BigDecimal averageRating;

    private Integer totalReviews;
}
