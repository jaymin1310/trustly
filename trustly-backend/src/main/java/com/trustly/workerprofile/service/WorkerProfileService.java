package com.trustly.workerprofile.service;

import com.trustly.worker.entity.WorkerApplication;
import com.trustly.workerprofile.dto.request.WorkerProfileRequest;
import com.trustly.workerprofile.dto.response.WorkerProfileResponse;

public interface WorkerProfileService {

    WorkerProfileResponse getMyProfile();

    WorkerProfileResponse completeProfile(
            WorkerProfileRequest request
    );
}