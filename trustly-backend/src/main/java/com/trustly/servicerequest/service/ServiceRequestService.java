package com.trustly.servicerequest.service;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.servicerequest.dto.request.CreateServiceRequestRequest;
import com.trustly.servicerequest.dto.request.RejectServiceRequestRequest;
import com.trustly.servicerequest.dto.response.ServiceRequestResponse;

import java.util.List;

public interface ServiceRequestService {

    ServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request
    );

    List<ServiceRequestResponse> getMyCustomerRequests(
            ServiceRequestStatus status
    );

    List<ServiceRequestResponse> getMyWorkerRequests(
            ServiceRequestStatus status
    );
    ServiceRequestResponse rejectRequest(
            Long requestId,
            RejectServiceRequestRequest request
    );
    ServiceRequestResponse acceptRequest(
    Long RequestId);
    ServiceRequestResponse completeRequest(
            Long requestId
    );
    ServiceRequestResponse requestCompletion(
            Long requestId
    );
    ServiceRequestResponse cancelRequest(Long requestId);
}