package com.trustly.workerprofile.controller;

import com.trustly.common.response.SuccessResponse;
import com.trustly.workerprofile.dto.request.WorkerProfileRequest;
import com.trustly.workerprofile.dto.response.WorkerProfileResponse;
import com.trustly.workerprofile.service.WorkerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/worker/profile")
@RequiredArgsConstructor
public class WorkerProfileController {

    private final WorkerProfileService workerProfileService;

    @GetMapping("/me")
    public ResponseEntity<WorkerProfileResponse> getMyProfile() {

        return ResponseEntity.ok(
                workerProfileService.getMyProfile()
        );
    }

    @PutMapping
    public ResponseEntity<SuccessResponse> completeProfile(
            @Valid @RequestBody WorkerProfileRequest request
    ) {

        workerProfileService.completeProfile(request);

        return ResponseEntity.ok(
                new SuccessResponse(
                        true,
                        "Worker profile completed successfully"
                )
        );
    }
}