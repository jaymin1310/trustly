package com.trustly.servicerequest.dto.response.nested;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WorkerDTO {
    private Long profileId;
    private Long userId;
    private String name;
}