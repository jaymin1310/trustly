package com.trustly.servicerequest.service.impl;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.exception.BadRequestException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.complaint.service.WorkerPenaltyEnforcementService;
import com.trustly.servicerequest.dto.request.CancelServiceRequestRequest;
import com.trustly.servicerequest.dto.request.CreateServiceRequestRequest;
import com.trustly.servicerequest.dto.request.RejectServiceRequestRequest;
import com.trustly.servicerequest.dto.response.ServiceRequestResponse;
import com.trustly.servicerequest.entity.ServiceRequest;
import com.trustly.servicerequest.mapper.ServiceRequestMapper;
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
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceRequestMapper serviceRequestMapper;
    private final WorkerPenaltyEnforcementService workerPenaltyEnforcementService;

    // ---------------- CREATE ----------------
    @Override
    public ServiceRequestResponse createServiceRequest(CreateServiceRequestRequest request) {

        User customer = getCurrentUser();

        WorkerProfile workerProfile = workerProfileRepository.findById(request.getWorkerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        if (customer.getId().equals(workerProfile.getWorker().getId())) {
            throw new BadRequestException("You cannot create a service request for yourself");
        }

        if (!Boolean.TRUE.equals(workerProfile.getProfileCompleted())) {
            throw new BadRequestException("Worker profile is not complete");
        }

        boolean exists = serviceRequestRepository
                .existsByCustomerIdAndWorkerProfileIdAndStatusIn(
                        customer.getId(),
                        workerProfile.getId(),
                        List.of(ServiceRequestStatus.PENDING, ServiceRequestStatus.ACCEPTED)
                );

        if (exists) {
            throw new BadRequestException("Active request already exists with this worker");
        }

        ServiceRequest sr = ServiceRequest.builder()
                .customer(customer)
                .workerProfile(workerProfile)
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .status(ServiceRequestStatus.PENDING)
                .build();
        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- CANCEL ----------------
    @Override
    public ServiceRequestResponse cancelRequest(
            Long requestId,
            CancelServiceRequestRequest request
    ) {

        User customer = getCurrentUser();

        ServiceRequest sr = getRequestOrThrow(requestId);

        validateCustomerOwnership(sr, customer);

        if (sr.getStatus() == ServiceRequestStatus.COMPLETED) {
            throw new BadRequestException("Completed request cannot be cancelled");
        }

        if (sr.getStatus() == ServiceRequestStatus.CANCELLED) {
            throw new BadRequestException("Request already cancelled");
        }

        if (sr.getStatus() == ServiceRequestStatus.REJECTED) {
            throw new BadRequestException("Rejected request cannot be cancelled");
        }

        if (sr.getStatus() == ServiceRequestStatus.WORK_COMPLETION_REQUESTED) {
            throw new BadRequestException("Cannot cancel after work completion request");
        }

        sr.setStatus(ServiceRequestStatus.CANCELLED);
        sr.setRespondedAt(LocalDateTime.now());
        sr.setCustomerRemark(request.getCustomerRemark());

        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- CUSTOMER REQUESTS ----------------
    @Override
    public List<ServiceRequestResponse> getMyCustomerRequests(ServiceRequestStatus status) {

        User customer = getCurrentUser();

        List<ServiceRequest> list = (status == null)
                ? serviceRequestRepository.findByCustomerIdOrderByRequestedAtDesc(customer.getId())
                : serviceRequestRepository.findByCustomerIdAndStatusOrderByRequestedAtDesc(customer.getId(), status);

        return list.stream()
                .map(serviceRequestMapper::toResponse)
                .toList();
    }

    // ---------------- WORKER REQUESTS ----------------
    @Override
    public List<ServiceRequestResponse> getMyWorkerRequests(ServiceRequestStatus status) {

        User worker = getCurrentUser();

        List<ServiceRequest> list = (status == null)
                ? serviceRequestRepository.findByWorkerProfileWorkerIdOrderByRequestedAtDesc(worker.getId())
                : serviceRequestRepository.findByWorkerProfileWorkerIdAndStatusOrderByRequestedAtDesc(
                        worker.getId(),
                        status
                );

        return list.stream()
                .map(serviceRequestMapper::toResponse)
                .toList();
    }

    // ---------------- ACCEPT ----------------
    @Override
    public ServiceRequestResponse acceptRequest(Long requestId) {

        User worker = getCurrentUser();
        ServiceRequest sr = getRequestOrThrow(requestId);

        validateWorkerOwnership(sr, worker);
        workerPenaltyEnforcementService.validateWorkerCanOperate(
                sr.getWorkerProfile().getId()
        );

        if (sr.getStatus() != ServiceRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be accepted");
        }

        sr.setStatus(ServiceRequestStatus.ACCEPTED);
        sr.setRespondedAt(LocalDateTime.now());

        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- REJECT ----------------
    @Override
    public ServiceRequestResponse rejectRequest(Long requestId, RejectServiceRequestRequest rejectRequest) {

        User worker = getCurrentUser();
        ServiceRequest sr = getRequestOrThrow(requestId);

        validateWorkerOwnership(sr, worker);
        workerPenaltyEnforcementService.validateWorkerCanOperate(
                sr.getWorkerProfile().getId()
        );

        if (sr.getStatus() != ServiceRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        sr.setStatus(ServiceRequestStatus.REJECTED);
        sr.setRespondedAt(LocalDateTime.now());
        sr.setWorkerRemark(rejectRequest.getWorkerRemark());

        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- REQUEST COMPLETION ----------------
    @Override
    public ServiceRequestResponse requestCompletion(Long requestId) {

        User worker = getCurrentUser();
        ServiceRequest sr = getRequestOrThrow(requestId);

        validateWorkerOwnership(sr, worker);
        workerPenaltyEnforcementService.validateWorkerCanOperate(
                sr.getWorkerProfile().getId()
        );

        if (sr.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new BadRequestException("Only accepted requests can request completion");
        }

        sr.setStatus(ServiceRequestStatus.WORK_COMPLETION_REQUESTED);

        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- COMPLETE ----------------
    @Override
    public ServiceRequestResponse completeRequest(Long requestId) {

        User customer = getCurrentUser();
        ServiceRequest sr = getRequestOrThrow(requestId);

        validateCustomerOwnership(sr, customer);

        if (sr.getStatus() != ServiceRequestStatus.WORK_COMPLETION_REQUESTED) {
            throw new BadRequestException("Only work completion requested can be completed");
        }

        sr.setStatus(ServiceRequestStatus.COMPLETED);
        sr.setCompletedAt(LocalDateTime.now());

        return serviceRequestMapper.toResponse(serviceRequestRepository.save(sr));
    }

    // ---------------- HELPERS ----------------

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ServiceRequest getRequestOrThrow(Long id) {
        return serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));
    }

    private void validateCustomerOwnership(ServiceRequest sr, User customer) {
        if (!sr.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("Not allowed for this customer");
        }
    }

    private void validateWorkerOwnership(ServiceRequest sr, User worker) {
        if (!sr.getWorkerProfile().getWorker().getId().equals(worker.getId())) {
            throw new BadRequestException("Not allowed for this worker");
        }
    }
}
