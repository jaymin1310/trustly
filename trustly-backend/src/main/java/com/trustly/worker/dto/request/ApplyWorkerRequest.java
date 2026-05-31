package com.trustly.worker.dto.request;

import com.trustly.common.enums.DocumentType;
import com.trustly.common.enums.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyWorkerRequest {

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Please enter a valid 10-digit mobile number"
    )
    private String phone;

    @NotNull(message = "Service category is required")
    private ServiceCategory category;

    @PositiveOrZero(message = "Experience years cannot be negative")
    private Integer experienceYears;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    @NotBlank(message = "Document number is required")
    private String documentNumber;
}