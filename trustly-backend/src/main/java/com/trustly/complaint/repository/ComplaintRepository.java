package com.trustly.complaint.repository;

import com.trustly.complaint.entity.Complaint;
import com.trustly.complaint.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    boolean existsByCustomer_IdAndServiceRequest_Id(
            Long customerId,
            Long serviceRequestId
    );

    Optional<Complaint> findByIdAndCustomer_Id(
            Long complaintId,
            Long customerId
    );

    List<Complaint> findByStatus(
            ComplaintStatus status
    );

    long countByStatus(
            ComplaintStatus status
    );

    List<Complaint> findByWorkerProfile_Id(
            Long workerProfileId
    );

    List<Complaint> findByServiceRequest_Id(
            Long serviceRequestId
    );
    List<Complaint> findByCustomer_IdOrderByCreatedAtDesc(
            Long customerId
    );
    List<Complaint> findAllByOrderByCreatedAtDesc();

}
