package com.trustly.complaint.service;

import com.trustly.complaint.dto.request.ComplaintDecisionRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import com.trustly.complaint.enums.ComplaintStatus;

import java.util.List;

public interface AdminComplaintService {

    void reviewComplaint(
            Long complaintId,
            ComplaintDecisionRequest request
    );

    List<ComplaintResponse> getComplaints(
            ComplaintStatus status
    );

    ComplaintDetailsResponse getComplaintDetails(
            Long complaintId
    );
}