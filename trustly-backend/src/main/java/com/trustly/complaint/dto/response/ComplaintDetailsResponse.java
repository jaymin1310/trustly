package com.trustly.complaint.dto.response;

import com.trustly.complaint.enums.ComplaintCategory;
import com.trustly.complaint.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ComplaintDetailsResponse {

    private Long id;

    private Long serviceRequestId;

    private Long customerId;

    private String customerName;

    private Long workerProfileId;

    private String workerName;

    private ComplaintCategory category;

    private String description;

    private ComplaintStatus status;

    private String resolutionNote;

    private String resolvedBy;

    private LocalDateTime resolvedAt;

    private List<ComplaintEvidenceResponse> evidences;

    private LocalDateTime createdAt;
}