package com.trustly.worker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
public class ReviewWorkerRequest {
    @NotBlank(message = "Remark is required")
    private String remark;
}
