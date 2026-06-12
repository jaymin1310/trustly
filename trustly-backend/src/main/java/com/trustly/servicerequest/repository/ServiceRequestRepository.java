package com.trustly.servicerequest.repository;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.servicerequest.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    boolean existsByCustomerIdAndWorkerProfileIdAndStatusIn(
            Long customerId,
            Long workerProfileId,
            Collection<ServiceRequestStatus> statuses
    );
    List<ServiceRequest> findByCustomerIdOrderByRequestedAtDesc(
            Long customerId
    );

    List<ServiceRequest> findByWorkerProfileWorkerIdOrderByRequestedAtDesc(
            Long workerId
    );
    List<ServiceRequest> findByCustomerIdAndStatusOrderByRequestedAtDesc(
            Long customerId,
            ServiceRequestStatus status
    );

    List<ServiceRequest> findByWorkerProfileWorkerIdAndStatusOrderByRequestedAtDesc(
            Long workerId,
            ServiceRequestStatus status
    );
}