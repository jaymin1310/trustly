package com.trustly.complaint.dto.response;

import com.trustly.complaint.enums.ComplaintEvidenceType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ComplaintEvidenceResponse {

    private Long id;

    private String fileUrl;

    private ComplaintEvidenceType fileType;

    private LocalDateTime uploadedAt;
}