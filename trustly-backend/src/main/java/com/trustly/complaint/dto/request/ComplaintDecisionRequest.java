package com.trustly.complaint.dto.request;

import com.trustly.complaint.enums.ComplaintDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ComplaintDecisionRequest {

    @NotNull(message = "Decision is required")
    private ComplaintDecision decision;

    @NotBlank(message = "Resolution note is required")
    private String resolutionNote;

    /**
     * Used only for TEMP_SUSPENSION
     */
    private Integer suspensionDays;
}