package com.trustly.complaint.service;

import com.trustly.complaint.dto.request.CreateComplaintRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ComplaintService {

    ComplaintResponse createComplaint(
            CreateComplaintRequest request,
            List<MultipartFile> evidences
    );

    List<ComplaintResponse> getMyComplaints();

    ComplaintDetailsResponse getComplaint(
            Long complaintId
    );
}