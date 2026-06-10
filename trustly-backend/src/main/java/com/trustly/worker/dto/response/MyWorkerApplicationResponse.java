package com.trustly.worker.dto.response;
import com.trustly.common.enums.WorkerApplicationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MyWorkerApplicationResponse {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private WorkerApplicationStatus status;

    private String adminRemark;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;
}