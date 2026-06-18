package com.trustly.admin.service.impl;

import com.trustly.admin.dto.response.AdminDashboardResponse;
import com.trustly.admin.service.AdminDashboardService;
import com.trustly.category.repository.ServiceCategoryRepository;
import com.trustly.common.enums.Role;
import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.enums.WorkerApplicationStatus;
import com.trustly.complaint.enums.ComplaintStatus;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.complaint.repository.ComplaintRepository;
import com.trustly.complaint.repository.WorkerPenaltyRepository;
import com.trustly.review.repository.ReviewRepository;
import com.trustly.servicerequest.repository.ServiceRequestRepository;
import com.trustly.user.repository.UserRepository;
import com.trustly.worker.repository.WorkerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final WorkerApplicationRepository workerApplicationRepository;
    private final ComplaintRepository complaintRepository;
    private final WorkerPenaltyRepository workerPenaltyRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public AdminDashboardResponse getDashboard() {
        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalWorkers(userRepository.countByRolesContaining(Role.WORKER))
                .totalCategories(serviceCategoryRepository.count())
                .totalServiceRequests(serviceRequestRepository.count())
                .totalReviews(reviewRepository.count())
                .activePenalties(workerPenaltyRepository.countByStatus(PenaltyStatus.ACTIVE))
                .serviceRequestsByStatus(countServiceRequestsByStatus())
                .workerApplicationsByStatus(countWorkerApplicationsByStatus())
                .complaintsByStatus(countComplaintsByStatus())
                .build();
    }

    private Map<ServiceRequestStatus, Long> countServiceRequestsByStatus() {
        return countEnumValues(
                ServiceRequestStatus.class,
                serviceRequestRepository::countByStatus
        );
    }

    private Map<WorkerApplicationStatus, Long> countWorkerApplicationsByStatus() {
        return countEnumValues(
                WorkerApplicationStatus.class,
                workerApplicationRepository::countByStatus
        );
    }

    private Map<ComplaintStatus, Long> countComplaintsByStatus() {
        return countEnumValues(
                ComplaintStatus.class,
                complaintRepository::countByStatus
        );
    }

    private <E extends Enum<E>> Map<E, Long> countEnumValues(
            Class<E> enumType,
            Function<E, Long> counter
    ) {
        return Arrays.stream(enumType.getEnumConstants())
                .collect(Collectors.toMap(
                        Function.identity(),
                        counter
                ));
    }
}
