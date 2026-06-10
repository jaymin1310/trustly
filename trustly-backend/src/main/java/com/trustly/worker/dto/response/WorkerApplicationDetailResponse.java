package com.trustly.worker.dto.response;

import com.trustly.common.enums.DocumentType;
import com.trustly.common.enums.WorkerApplicationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class WorkerApplicationDetailResponse {

    private Long id;

    private String applicantName;

    private String applicantEmail;

    private String phone;

    private Long categoryId;

    private String categoryName;

    private Integer experienceYears;

    private String address;

    private DocumentType documentType;

    private String documentNumber;

    private String documentUrl;

    private WorkerApplicationStatus status;

    private String adminRemark;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;
}