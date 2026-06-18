package com.trustly.complaint.service.impl;

import com.trustly.common.exception.BadRequestException;
import com.trustly.common.exception.ResourceNotFoundException;
import com.trustly.common.util.SecurityUtils;
import com.trustly.complaint.dto.request.ComplaintDecisionRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintEvidenceResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import com.trustly.complaint.entity.Complaint;
import com.trustly.complaint.entity.ComplaintEvidence;
import com.trustly.complaint.entity.WorkerPenalty;
import com.trustly.complaint.enums.ComplaintStatus;
import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.complaint.repository.ComplaintRepository;
import com.trustly.complaint.repository.WorkerPenaltyRepository;
import com.trustly.complaint.service.AdminComplaintService;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminComplaintServiceImpl
        implements AdminComplaintService {

    private final ComplaintRepository complaintRepository;
    private final WorkerPenaltyRepository workerPenaltyRepository;
    private final UserRepository userRepository;

    @Override
    public void reviewComplaint(
            Long complaintId,
            ComplaintDecisionRequest request
    ) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Complaint not found"
                                ));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new BadRequestException(
                    "Complaint has already been reviewed"
            );
        }

        User admin = getCurrentAdmin();

        switch (request.getDecision()) {

            case REJECT ->
                    rejectComplaint(
                            complaint,
                            admin,
                            request
                    );

            case RESOLVE ->
                    resolveComplaint(
                            complaint,
                            admin,
                            request
                    );

            case WARNING ->
                    issueWarning(
                            complaint,
                            admin,
                            request
                    );

            case TEMP_SUSPENSION ->
                    issueSuspension(
                            complaint,
                            admin,
                            request
                    );

            case PERMANENT_BAN ->
                    issuePermanentBan(
                            complaint,
                            admin,
                            request
                    );

            default ->
                    throw new BadRequestException(
                            "Invalid complaint decision"
                    );
        }
    }

    @Override
    public List<ComplaintResponse> getComplaints(
            ComplaintStatus status
    ) {

        List<Complaint> complaints;

        if (status == null) {

            complaints =
                    complaintRepository
                            .findAllByOrderByCreatedAtDesc();

        } else {

            complaints =
                    complaintRepository
                            .findByStatus(status);
        }

        return complaints.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ComplaintDetailsResponse getComplaintDetails(
            Long complaintId
    ) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
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
                .id(
                        complaint.getId()
                )
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

    private User getCurrentAdmin() {

        String email =
                SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Admin not found"
                        ));
    }

    private void rejectComplaint(
            Complaint complaint,
            User admin,
            ComplaintDecisionRequest request
    ) {

        complaint.setStatus(
                ComplaintStatus.REJECTED
        );

        complaint.setResolutionNote(
                request.getResolutionNote()
        );

        complaint.setResolvedBy(
                admin
        );

        complaint.setResolvedAt(
                LocalDateTime.now()
        );

        complaintRepository.save(
                complaint
        );
    }

    private void resolveComplaint(
            Complaint complaint,
            User admin,
            ComplaintDecisionRequest request
    ) {

        complaint.setStatus(
                ComplaintStatus.RESOLVED
        );

        complaint.setResolutionNote(
                request.getResolutionNote()
        );

        complaint.setResolvedBy(
                admin
        );

        complaint.setResolvedAt(
                LocalDateTime.now()
        );

        complaintRepository.save(
                complaint
        );
    }

    private void issueWarning(
            Complaint complaint,
            User admin,
            ComplaintDecisionRequest request
    ) {

        resolveComplaint(
                complaint,
                admin,
                request
        );

        createPenalty(
                complaint,
                admin,
                PenaltyAction.WARNING,
                request.getResolutionNote(),
                null
        );
    }

    private void issueSuspension(
            Complaint complaint,
            User admin,
            ComplaintDecisionRequest request
    ) {

        if (request.getSuspensionDays() == null
                || request.getSuspensionDays() <= 0) {

            throw new BadRequestException(
                    "Suspension days must be greater than zero"
            );
        }
        if (request.getSuspensionDays() > 365) {
            throw new BadRequestException(
                    "Suspension days cannot exceed 365"
            );
        }

        resolveComplaint(
                complaint,
                admin,
                request
        );

        createPenalty(
                complaint,
                admin,
                PenaltyAction.TEMP_SUSPENSION,
                request.getResolutionNote(),
                request.getSuspensionDays()
        );
    }

    private void issuePermanentBan(
            Complaint complaint,
            User admin,
            ComplaintDecisionRequest request
    ) {

        resolveComplaint(
                complaint,
                admin,
                request
        );

        createPenalty(
                complaint,
                admin,
                PenaltyAction.PERMANENT_BAN,
                request.getResolutionNote(),
                null
        );
    }

    private void createPenalty(
            Complaint complaint,
            User admin,
            PenaltyAction action,
            String reason,
            Integer suspensionDays
    ) {

        LocalDateTime now =
                LocalDateTime.now();

        WorkerPenalty penalty =
                WorkerPenalty.builder()
                        .workerProfile(
                                complaint.getWorkerProfile()
                        )
                        .complaint(
                                complaint
                        )
                        .admin(
                                admin
                        )
                        .action(
                                action
                        )
                        .status(
                                PenaltyStatus.ACTIVE
                        )
                        .reason(
                                reason
                        )
                        .startAt(
                                now
                        )
                        .endAt(
                                suspensionDays == null
                                        ? null
                                        : now.plusDays(
                                        suspensionDays
                                )
                        )
                        .build();

        workerPenaltyRepository.save(
                penalty
        );
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