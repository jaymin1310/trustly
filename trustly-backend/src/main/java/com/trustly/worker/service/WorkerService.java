package com.trustly.worker.service;

import com.trustly.worker.dto.request.ApplyWorkerRequest;
import com.trustly.worker.dto.request.ReviewWorkerRequest;
import com.trustly.worker.dto.response.WorkerApplicationDetailResponse;
import com.trustly.worker.dto.response.WorkerApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface WorkerService {

    void apply(
            ApplyWorkerRequest request,
            MultipartFile document
    );

    WorkerApplicationDetailResponse getMyApplication();

    Page<WorkerApplicationResponse> getApplications(
            int page,
            int size
    );

    WorkerApplicationDetailResponse getApplicationById(
            Long applicationId
    );

    void approve(Long applicationId);

    void reject(
            Long applicationId,
            ReviewWorkerRequest request
    );
}