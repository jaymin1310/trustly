package com.trustly.admin.dto.response;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.common.enums.WorkerApplicationStatus;
import com.trustly.complaint.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalWorkers;

    private long totalCategories;

    private long totalServiceRequests;

    private long totalReviews;

    private long activePenalties;

    private Map<ServiceRequestStatus, Long> serviceRequestsByStatus;

    private Map<WorkerApplicationStatus, Long> workerApplicationsByStatus;

    private Map<ComplaintStatus, Long> complaintsByStatus;
}
