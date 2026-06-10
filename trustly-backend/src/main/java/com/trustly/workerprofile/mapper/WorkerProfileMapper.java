package com.trustly.workerprofile.mapper;

import com.trustly.workerprofile.dto.response.WorkerProfileResponse;
import com.trustly.workerprofile.entity.WorkerProfile;
import org.springframework.stereotype.Component;

@Component
public class WorkerProfileMapper {

    public WorkerProfileResponse toResponse(
            WorkerProfile profile
    ) {

        return WorkerProfileResponse.builder()
                .id(profile.getId())
                .workerId(profile.getWorker().getId())
                .workerName(profile.getWorker().getName())
                .bio(profile.getBio())
                .experienceYears(profile.getExperienceYears())
                .city(profile.getCity())
                .state(profile.getState())
                .profileCompleted(profile.getProfileCompleted())
                .build();
    }
}