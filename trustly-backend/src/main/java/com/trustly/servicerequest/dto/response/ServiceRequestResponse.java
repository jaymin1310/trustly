package com.trustly.servicerequest.dto.response;

import com.trustly.common.enums.ServiceRequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ServiceRequestResponse {

    private Long id;

    private Long customerId;
    private String customerName;

    private Long workerProfileId;
    private Long workerId;
    private String workerName;

    private Long categoryId;
    private String categoryName;

    private String title;
    private String description;
    private String address;

    private ServiceRequestStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;
    private String workerRemark;
}