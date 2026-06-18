package com.trustly.complaint.controller;

import com.trustly.complaint.dto.request.ComplaintDecisionRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import com.trustly.complaint.enums.ComplaintStatus;
import com.trustly.complaint.service.AdminComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/complaints")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final AdminComplaintService adminComplaintService;

    @GetMapping
    public List<ComplaintResponse> getComplaints(
            @RequestParam(required = false)
            ComplaintStatus status
    ) {

        return adminComplaintService.getComplaints(
                status
        );
    }

    @GetMapping("/{complaintId}")
    public ComplaintDetailsResponse getComplaintDetails(
            @PathVariable Long complaintId
    ) {

        return adminComplaintService.getComplaintDetails(
                complaintId
        );
    }

    @PostMapping("/{complaintId}/decision")
    public void reviewComplaint(
            @PathVariable Long complaintId,
            @Valid
            @RequestBody ComplaintDecisionRequest request
    ) {

        adminComplaintService.reviewComplaint(
                complaintId,
                request
        );
    }
}