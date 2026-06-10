package com.trustly.workerprofile.service.impl;

import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import com.trustly.workerprofile.dto.request.WorkerProfileRequest;
import com.trustly.workerprofile.dto.response.WorkerProfileResponse;
import com.trustly.workerprofile.entity.WorkerProfile;
import com.trustly.workerprofile.mapper.WorkerProfileMapper;
import com.trustly.workerprofile.repository.WorkerProfileRepository;
import com.trustly.workerprofile.service.WorkerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerProfileServiceImpl
        implements WorkerProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;
    private final WorkerProfileMapper workerProfileMapper;

    private User getCurrentUser() {

        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerProfileResponse getMyProfile() {

        User worker = getCurrentUser();

        WorkerProfile profile =
                workerProfileRepository
                        .findByWorkerId(worker.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker profile not found"
                                ));

        return workerProfileMapper.toResponse(profile);
    }

    @Override
    public WorkerProfileResponse completeProfile(
            WorkerProfileRequest request
    ) {

        User worker = getCurrentUser();

        WorkerProfile profile =
                workerProfileRepository
                        .findByWorkerId(worker.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker profile not found"
                                ));

        profile.setBio(request.getBio());
        profile.setExperienceYears(
                request.getExperienceYears()
        );
        profile.setCity(request.getCity());
        profile.setState(request.getState());

        profile.setProfileCompleted(true);

        WorkerProfile savedProfile =
                workerProfileRepository.save(profile);

        return workerProfileMapper.toResponse(savedProfile);
    }
}