package com.trustly.worker.service;

import com.trustly.common.enums.Role;
import com.trustly.common.enums.WorkerApplicationStatus;
import com.trustly.common.exception.BusinessException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import com.trustly.worker.dto.request.ApplyWorkerRequest;
import com.trustly.worker.dto.request.ReviewWorkerRequest;
import com.trustly.worker.dto.response.MyWorkerApplicationResponse;
import com.trustly.worker.dto.response.WorkerApplicationDetailResponse;
import com.trustly.worker.dto.response.WorkerApplicationResponse;
import com.trustly.worker.entity.WorkerApplication;
import com.trustly.worker.repository.WorkerApplicationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl implements WorkerService{
    private final WorkerApplicationRepository  workerApplicationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    @Override
    @Transactional
    public void apply(
            ApplyWorkerRequest request,
            MultipartFile document
    ) {

        String email =
                SecurityUtils.getCurrentUserEmail();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (user.getRoles().contains(Role.WORKER)) {
            throw new BusinessException(
                    "User is already a worker"
            );
        }

        Optional<WorkerApplication> latestApplication =
                workerApplicationRepository
                        .findTopByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        if (latestApplication.isPresent()) {

            WorkerApplicationStatus status =
                    latestApplication.get().getStatus();

            if (status == WorkerApplicationStatus.PENDING) {
                throw new BusinessException(
                        "Worker application is already pending"
                );
            }

            if (status == WorkerApplicationStatus.APPROVED) {
                throw new BusinessException(
                        "Worker application is already approved"
                );
            }
        }

        String documentUrl =
                fileStorageService.storeDocument(
                        document
                );

        WorkerApplication workerApplication =
                WorkerApplication.builder()
                        .user(user)
                        .phone(request.getPhone())
                        .category(request.getCategory())
                        .experienceYears(
                                request.getExperienceYears()
                        )
                        .address(request.getAddress())
                        .documentType(
                                request.getDocumentType()
                        )
                        .documentNumber(
                                request.getDocumentNumber()
                        )
                        .documentUrl(documentUrl)
                        .status(
                                WorkerApplicationStatus.PENDING
                        )
                        .build();
        workerApplicationRepository.save(
                workerApplication
        );
    }
    @Override
    @Transactional(readOnly = true)
    public MyWorkerApplicationResponse getMyApplication() {

        String email =
                SecurityUtils.getCurrentUserEmail();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        WorkerApplication application =
                workerApplicationRepository
                        .findTopByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No worker application found"
                                )
                        );

        return MyWorkerApplicationResponse
                .builder()
                .id(application.getId())
                .category(application.getCategory())
                .status(application.getStatus())
                .adminRemark(
                        application.getAdminRemark()
                )
                .createdAt(
                        application.getCreatedAt()
                )
                .reviewedAt(
                        application.getReviewedAt()
                )
                .build();
    }
    @Override
    @Transactional(readOnly = true)
    public Page<WorkerApplicationResponse> getApplications(
            WorkerApplicationStatus status,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        Page<WorkerApplication> applications;

        if (status == null) {

            applications =
                    workerApplicationRepository
                            .findAll(pageable);

        } else {

            applications =
                    workerApplicationRepository
                            .findByStatus(
                                    status,
                                    pageable
                            );
        }

        return applications.map(
                application ->
                        WorkerApplicationResponse
                                .builder()
                                .id(application.getId())
                                .applicantName(
                                        application.getUser().getName()
                                )
                                .email(
                                        application.getUser().getEmail()
                                )
                                .category(
                                        application.getCategory()
                                )
                                .status(
                                        application.getStatus()
                                )
                                .build()
        );
    }
    @Override
    @Transactional(readOnly = true)
    public WorkerApplicationDetailResponse getApplicationById(
            Long applicationId
    ) {

        WorkerApplication application =
                workerApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker application not found"
                                )
                        );

        return WorkerApplicationDetailResponse
                .builder()
                .id(application.getId())
                .applicantName(
                        application.getUser().getName()
                )
                .applicantEmail(
                        application.getUser().getEmail()
                )
                .phone(application.getPhone())
                .category(application.getCategory())
                .experienceYears(
                        application.getExperienceYears()
                )
                .address(application.getAddress())
                .documentType(
                        application.getDocumentType()
                )
                .documentNumber(
                        application.getDocumentNumber()
                )
                .documentUrl(
                        application.getDocumentUrl()
                )
                .status(
                        application.getStatus()
                )
                .adminRemark(
                        application.getAdminRemark()
                )
                .reviewedBy(
                        application.getReviewedBy() != null
                                ? application.getReviewedBy().getName()
                                : null
                )
                .reviewedAt(
                        application.getReviewedAt()
                )
                .createdAt(
                        application.getCreatedAt()
                )
                .build();
    }
    @Override
    @Transactional
    public void approve(Long applicationId) {

        WorkerApplication application =
                workerApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker application not found"
                                )
                        );

        if (application.getStatus() != WorkerApplicationStatus.PENDING) {
            throw new BusinessException(
                    "Only pending applications can be approved"
            );
        }

        String adminEmail =
                SecurityUtils.getCurrentUserEmail();

        User admin = userRepository
                .findByEmail(adminEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Admin not found"
                        )
                );

        application.setStatus(
                WorkerApplicationStatus.APPROVED
        );

        application.setReviewedBy(admin);

        application.setReviewedAt(
                LocalDateTime.now()
        );

        User applicant = application.getUser();

        applicant.getRoles().add(Role.WORKER);

        workerApplicationRepository.save(application);

        userRepository.save(applicant);
    }
    @Override
    @Transactional
    public void reject(
            Long applicationId,
            ReviewWorkerRequest request
    ) {

        WorkerApplication application =
                workerApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker application not found"
                                )
                        );

        if (application.getStatus() != WorkerApplicationStatus.PENDING) {
            throw new BusinessException(
                    "Only pending applications can be rejected"
            );
        }

        String adminEmail =
                SecurityUtils.getCurrentUserEmail();

        User admin = userRepository
                .findByEmail(adminEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Admin not found"
                        )
                );

        application.setStatus(
                WorkerApplicationStatus.REJECTED
        );

        application.setAdminRemark(
                request.getRemark()
        );

        application.setReviewedBy(
                admin
        );

        application.setReviewedAt(
                LocalDateTime.now()
        );

        workerApplicationRepository.save(
                application
        );
    }

}
