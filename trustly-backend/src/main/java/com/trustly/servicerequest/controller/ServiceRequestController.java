package com.trustly.servicerequest.controller;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.servicerequest.dto.request.CreateServiceRequestRequest;
import com.trustly.servicerequest.dto.request.RejectServiceRequestRequest;
import com.trustly.servicerequest.dto.response.ServiceRequestResponse;
import com.trustly.servicerequest.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping
    public ServiceRequestResponse createServiceRequest(
            @Valid @RequestBody CreateServiceRequestRequest request
    ) {
        return serviceRequestService.createServiceRequest(request);
    }

    @GetMapping("/customer")
    public List<ServiceRequestResponse> getMyCustomerRequests(
            @RequestParam(required = false)
            ServiceRequestStatus status
    ) {
        return serviceRequestService.getMyCustomerRequests(status);
    }

    @GetMapping("/worker")
    public List<ServiceRequestResponse> getMyWorkerRequests(
            @RequestParam(required = false)
            ServiceRequestStatus status
    ) {
        return serviceRequestService.getMyWorkerRequests(status);
    }

    @PatchMapping("/{requestId}/accept")
    public ServiceRequestResponse acceptRequest(
            @PathVariable Long requestId
    ) {
        return serviceRequestService.acceptRequest(requestId);
    }

    @PatchMapping("/{requestId}/reject")
    public ServiceRequestResponse rejectRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody RejectServiceRequestRequest request
    ) {
        return serviceRequestService.rejectRequest(
                requestId,
                request
        );
    }

    @PatchMapping("/{requestId}/request-completion")
    public ServiceRequestResponse requestCompletion(
            @PathVariable Long requestId
    ) {
        return serviceRequestService.requestCompletion(requestId);
    }

    @PatchMapping("/{requestId}/complete")
    public ServiceRequestResponse completeRequest(
            @PathVariable Long requestId
    ) {
        return serviceRequestService.completeRequest(requestId);
    }

    @PatchMapping("/{requestId}/cancel")
    public ServiceRequestResponse cancelRequest(
            @PathVariable Long requestId
    ) {
        return serviceRequestService.cancelRequest(requestId);
    }
}