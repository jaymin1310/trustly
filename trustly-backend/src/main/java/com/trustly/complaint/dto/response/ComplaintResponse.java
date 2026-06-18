package com.trustly.complaint.dto.response;

import com.trustly.complaint.enums.ComplaintCategory;
import com.trustly.complaint.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ComplaintResponse {

    private Long id;

    private Long serviceRequestId;

    private Long workerProfileId;

    private ComplaintCategory category;

    private String description;

    private ComplaintStatus status;

    private LocalDateTime createdAt;
}