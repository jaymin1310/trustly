package com.trustly.worker.dto.response;

import com.trustly.common.enums.WorkerApplicationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class WorkerApplicationResponse {

    private Long id;

    private String applicantName;

    private String email;

    private Long categoryId;

    private String categoryName;

    private WorkerApplicationStatus status;
}