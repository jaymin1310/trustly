package com.trustly.complaint.dto.response;

import com.trustly.complaint.enums.ComplaintEvidenceType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ComplaintUploadResult {

    private String fileUrl;

    private String publicId;

    private ComplaintEvidenceType evidenceType;
}