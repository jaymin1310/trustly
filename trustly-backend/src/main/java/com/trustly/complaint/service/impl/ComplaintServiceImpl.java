package com.trustly.complaint.service.impl;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.exception.BadRequestException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.complaint.dto.request.CreateComplaintRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintEvidenceResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import com.trustly.complaint.dto.response.ComplaintUploadResult;
import com.trustly.complaint.entity.Complaint;
import com.trustly.complaint.entity.ComplaintEvidence;
import com.trustly.complaint.enums.ComplaintStatus;
import com.trustly.complaint.repository.ComplaintEvidenceRepository;
import com.trustly.complaint.repository.ComplaintRepository;
import com.trustly.complaint.service.ComplaintFileStorageService;
import com.trustly.complaint.service.ComplaintService;
import com.trustly.servicerequest.entity.ServiceRequest;
import com.trustly.servicerequest.repository.ServiceRequestRepository;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private static final int MAX_EVIDENCE_FILES = 5;

    private final ComplaintRepository complaintRepository;
    private final ComplaintEvidenceRepository complaintEvidenceRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ComplaintFileStorageService complaintFileStorageService;

    @Override
    public ComplaintResponse createComplaint(
            CreateComplaintRequest request,
            List<MultipartFile> evidences
    ) {

        User customer = getCurrentUser();

        validateEvidenceFiles(evidences);

        ServiceRequest serviceRequest =
                validateComplaintCreation(
                        request.getServiceRequestId(),
                        customer
                );

        Complaint complaint = Complaint.builder()
                .customer(customer)
                .workerProfile(serviceRequest.getWorkerProfile())
                .serviceRequest(serviceRequest)
                .category(request.getCategory())
                .description(request.getDescription())
                .status(ComplaintStatus.PENDING)
                .build();

        Complaint savedComplaint =
                complaintRepository.save(complaint);

        saveEvidenceFiles(
                savedComplaint,
                evidences
        );

        return mapToResponse(savedComplaint);
    }

    @Override
    public List<ComplaintResponse> getMyComplaints() {

        User customer = getCurrentUser();

        return complaintRepository
                .findByCustomer_IdOrderByCreatedAtDesc(
                        customer.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ComplaintDetailsResponse getComplaint(
            Long complaintId
    ) {

        User customer = getCurrentUser();

        Complaint complaint =
                complaintRepository
                        .findByIdAndCustomer_Id(
                                complaintId,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Complaint not found"
                                ));

        List<ComplaintEvidenceResponse> evidences =
                complaint.getEvidences() == null
                        ? Collections.emptyList()
                        : complaint.getEvidences()
                        .stream()
                        .map(this::mapEvidence)
                        .toList();

        return ComplaintDetailsResponse.builder()
                .id(complaint.getId())
                .serviceRequestId(
                        complaint.getServiceRequest().getId()
                )
                .customerId(
                        complaint.getCustomer().getId()
                )
                .customerName(
                        complaint.getCustomer().getName()
                )
                .workerProfileId(
                        complaint.getWorkerProfile().getId()
                )
                .workerName(
                        complaint.getWorkerProfile()
                                .getWorker()
                                .getName()
                )
                .category(
                        complaint.getCategory()
                )
                .description(
                        complaint.getDescription()
                )
                .status(
                        complaint.getStatus()
                )
                .resolutionNote(
                        complaint.getResolutionNote()
                )
                .resolvedBy(
                        complaint.getResolvedBy() == null
                                ? null
                                : complaint.getResolvedBy().getName()
                )
                .resolvedAt(
                        complaint.getResolvedAt()
                )
                .evidences(
                        evidences
                )
                .createdAt(
                        complaint.getCreatedAt()
                )
                .build();
    }

    private User getCurrentUser() {

        String email =
                SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        ));
    }

    private ServiceRequest validateComplaintCreation(
            Long serviceRequestId,
            User customer
    ) {

        ServiceRequest serviceRequest =
                serviceRequestRepository.findById(serviceRequestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found"
                                ));

        if (!serviceRequest.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new BadRequestException(
                    "You can only raise complaints for your own service requests"
            );
        }

        if (serviceRequest.getWorkerProfile() == null) {

            throw new BadRequestException(
                    "No worker assigned to this service request"
            );
        }

        if (serviceRequest.getStatus()
                != ServiceRequestStatus.COMPLETED) {

            throw new BadRequestException(
                    "Complaint can only be raised for completed service requests"
            );
        }

        boolean alreadyExists =
                complaintRepository
                        .existsByCustomer_IdAndServiceRequest_Id(
                                customer.getId(),
                                serviceRequestId
                        );

        if (alreadyExists) {

            throw new BadRequestException(
                    "Complaint already exists for this service request"
            );
        }

        return serviceRequest;
    }

    private void validateEvidenceFiles(
            List<MultipartFile> evidences
    ) {

        if (evidences == null) {
            return;
        }

        if (evidences.size() > MAX_EVIDENCE_FILES) {

            throw new BadRequestException(
                    "Maximum 5 evidence files are allowed"
            );
        }
    }

    private void saveEvidenceFiles(
            Complaint complaint,
            List<MultipartFile> files
    ) {

        if (files == null || files.isEmpty()) {
            return;
        }

        for (MultipartFile file : files) {

            ComplaintUploadResult uploadResult =
                    complaintFileStorageService
                            .uploadEvidence(file);

            ComplaintEvidence evidence =
                    ComplaintEvidence.builder()
                            .complaint(complaint)
                            .fileUrl(
                                    uploadResult.getFileUrl()
                            )
                            .publicId(
                                    uploadResult.getPublicId()
                            )
                            .fileType(
                                    uploadResult.getEvidenceType()
                            )
                            .build();

            complaintEvidenceRepository.save(
                    evidence
            );
        }
    }

    private ComplaintResponse mapToResponse(
            Complaint complaint
    ) {

        return ComplaintResponse.builder()
                .id(
                        complaint.getId()
                )
                .serviceRequestId(
                        complaint.getServiceRequest().getId()
                )
                .workerProfileId(
                        complaint.getWorkerProfile().getId()
                )
                .category(
                        complaint.getCategory()
                )
                .description(
                        complaint.getDescription()
                )
                .status(
                        complaint.getStatus()
                )
                .createdAt(
                        complaint.getCreatedAt()
                )
                .build();
    }

    private ComplaintEvidenceResponse mapEvidence(
            ComplaintEvidence evidence
    ) {

        return ComplaintEvidenceResponse.builder()
                .id(
                        evidence.getId()
                )
                .fileUrl(
                        evidence.getFileUrl()
                )
                .fileType(
                        evidence.getFileType()
                )
                .uploadedAt(
                        evidence.getUploadedAt()
                )
                .build();
    }
}