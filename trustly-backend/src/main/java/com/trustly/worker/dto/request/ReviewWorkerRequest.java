package com.trustly.worker.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ReviewWorkerRequest {
    @NotBlank(message = "Remark is required")
    private String remark;
}
