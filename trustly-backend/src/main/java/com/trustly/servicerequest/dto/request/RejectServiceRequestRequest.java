package com.trustly.servicerequest.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectServiceRequestRequest {

    @NotBlank(message = "Remark is required")
    private String workerRemark;
}