package com.trustly.workerprofile.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class WorkerProfileResponse {

    private Long id;

    private Long workerId;

    private String workerName;

    private String bio;

    private Integer experienceYears;

    private String city;

    private String state;

    private Boolean profileCompleted;
}