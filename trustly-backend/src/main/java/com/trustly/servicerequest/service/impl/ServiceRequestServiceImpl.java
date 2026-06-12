package com.trustly.servicerequest.service.impl;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.exception.BadRequestException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.servicerequest.dto.request.CreateServiceRequestRequest;
import com.trustly.servicerequest.dto.request.RejectServiceRequestRequest;
import com.trustly.servicerequest.dto.response.ServiceRequestResponse;
import com.trustly.servicerequest.entity.ServiceRequest;
import com.trustly.servicerequest.repository.ServiceRequestRepository;
import com.trustly.servicerequest.service.ServiceRequestService;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import com.trustly.workerprofile.entity.WorkerProfile;
import com.trustly.workerprofile.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl
        implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Override
    public ServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        WorkerProfile workerProfile = workerProfileRepository
                .findById(request.getWorkerProfileId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Worker profile not found"
                        )
                );

        if (customer.getId().equals(
                workerProfile.getWorker().getId()
        )) {
            throw new BadRequestException(
                    "You cannot create a service request for yourself"
            );
        }

        boolean activeRequestExists =
                serviceRequestRepository
                        .existsByCustomerIdAndWorkerProfileIdAndStatusIn(
                                customer.getId(),
                                workerProfile.getId(),
                                List.of(
                                        ServiceRequestStatus.PENDING,
                                        ServiceRequestStatus.ACCEPTED
                                )
                        );

        if (activeRequestExists) {
            throw new BadRequestException(
                    "You already have an active service request with this worker"
            );
        }

        ServiceRequest serviceRequest =
                ServiceRequest.builder()
                        .customer(customer)
                        .workerProfile(workerProfile)
                        .title(request.getTitle())
                        .description(request.getDescription())
                        .address(request.getAddress())
                        .status(ServiceRequestStatus.PENDING)
                        .build();

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        serviceRequest
                );

        return mapToResponse(savedRequest);
    }

    private ServiceRequestResponse mapToResponse(
            ServiceRequest serviceRequest
    ) {

        return ServiceRequestResponse.builder()
                .id(serviceRequest.getId())

                .customerId(
                        serviceRequest.getCustomer().getId()
                )
                .customerName(
                        serviceRequest.getCustomer().getName()
                )

                .workerProfileId(
                        serviceRequest.getWorkerProfile().getId()
                )
                .workerId(
                        serviceRequest.getWorkerProfile()
                                .getWorker()
                                .getId()
                )
                .workerName(
                        serviceRequest.getWorkerProfile()
                                .getWorker()
                                .getName()
                )

                .categoryId(
                        serviceRequest.getWorkerProfile()
                                .getCategory()
                                .getId()
                )
                .categoryName(
                        serviceRequest.getWorkerProfile()
                                .getCategory()
                                .getName()
                )

                .title(serviceRequest.getTitle())
                .description(serviceRequest.getDescription())
                .address(serviceRequest.getAddress())

                .status(serviceRequest.getStatus())

                .requestedAt(
                        serviceRequest.getRequestedAt()
                )
                .respondedAt(
                        serviceRequest.getRespondedAt()
                )
                .completedAt(
                        serviceRequest.getCompletedAt()
                )
                .workerRemark(
                        serviceRequest.getWorkerRemark()
                )
                .build();
    }
    @Override
    public List<ServiceRequestResponse> getMyCustomerRequests(
            ServiceRequestStatus status
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        List<ServiceRequest> requests;

        if (status == null) {

            requests = serviceRequestRepository
                    .findByCustomerIdOrderByRequestedAtDesc(
                            customer.getId()
                    );

        } else {

            requests = serviceRequestRepository
                    .findByCustomerIdAndStatusOrderByRequestedAtDesc(
                            customer.getId(),
                            status
                    );
        }

        return requests.stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public List<ServiceRequestResponse> getMyWorkerRequests(
            ServiceRequestStatus status
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User worker = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        List<ServiceRequest> requests;

        if (status == null) {

            requests = serviceRequestRepository
                    .findByWorkerProfileWorkerIdAndStatusOrderByRequestedAtDesc(
                            worker.getId(),
                            ServiceRequestStatus.PENDING
                    );

        } else {

            requests = serviceRequestRepository
                    .findByWorkerProfileWorkerIdAndStatusOrderByRequestedAtDesc(
                            worker.getId(),
                            status
                    );
        }

        return requests.stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public ServiceRequestResponse acceptRequest(
            Long requestId
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User worker = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        ServiceRequest request = serviceRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service request not found"
                        )
                );

        if (!request.getWorkerProfile()
                .getWorker()
                .getId()
                .equals(worker.getId())) {

            throw new BadRequestException(
                    "You are not allowed to accept this request"
            );
        }

        if (request.getStatus()
                != ServiceRequestStatus.PENDING) {

            throw new BadRequestException(
                    "Only pending requests can be accepted"
            );
        }

        request.setStatus(
                ServiceRequestStatus.ACCEPTED
        );

        request.setRespondedAt(
                LocalDateTime.now()
        );

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        request
                );

        return mapToResponse(savedRequest);
    }
    @Override
    public ServiceRequestResponse rejectRequest(
            Long requestId,
            RejectServiceRequestRequest rejectRequest
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User worker = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found"
                                )
                        );

        if (!serviceRequest.getWorkerProfile()
                .getWorker()
                .getId()
                .equals(worker.getId())) {

            throw new BadRequestException(
                    "You are not allowed to reject this request"
            );
        }

        if (serviceRequest.getStatus()
                != ServiceRequestStatus.PENDING) {

            throw new BadRequestException(
                    "Only pending requests can be rejected"
            );
        }

        serviceRequest.setStatus(
                ServiceRequestStatus.REJECTED
        );

        serviceRequest.setRespondedAt(
                LocalDateTime.now()
        );

        serviceRequest.setWorkerRemark(
                rejectRequest.getWorkerRemark()
        );

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        serviceRequest
                );

        return mapToResponse(savedRequest);
    }
    @Override
    public ServiceRequestResponse completeRequest(
            Long requestId
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found"
                                )
                        );

        if (!serviceRequest.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new BadRequestException(
                    "You are not allowed to complete this request"
            );
        }

        if (serviceRequest.getStatus()
                != ServiceRequestStatus.WORK_COMPLETION_REQUESTED) {

            throw new BadRequestException(
                    "Only work completion requested requests can be completed"
            );
        }

        serviceRequest.setStatus(
                ServiceRequestStatus.COMPLETED
        );

        serviceRequest.setCompletedAt(
                LocalDateTime.now()
        );

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        serviceRequest
                );

        return mapToResponse(savedRequest);
    }
    @Override
    public ServiceRequestResponse requestCompletion(
            Long requestId
    ) {

        String email = SecurityUtils.getCurrentUserEmail();

        User worker = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found"
                                )
                        );

        if (!serviceRequest.getWorkerProfile()
                .getWorker()
                .getId()
                .equals(worker.getId())) {

            throw new BadRequestException(
                    "You are not allowed to request completion for this request"
            );
        }

        if (serviceRequest.getStatus()
                != ServiceRequestStatus.ACCEPTED) {

            throw new BadRequestException(
                    "Only accepted requests can move to completion request state"
            );
        }

        serviceRequest.setStatus(
                ServiceRequestStatus.WORK_COMPLETION_REQUESTED
        );

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        serviceRequest
                );

        return mapToResponse(savedRequest);
    }
}