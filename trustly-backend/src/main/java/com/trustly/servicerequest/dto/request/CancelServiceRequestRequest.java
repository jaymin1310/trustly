package com.trustly.servicerequest.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelServiceRequestRequest {

    @NotBlank(message = "Remark is required")
    private String customerRemark;
}
