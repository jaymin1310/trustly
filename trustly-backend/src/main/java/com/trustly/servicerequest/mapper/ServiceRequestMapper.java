package com.trustly.servicerequest.mapper;

import com.trustly.servicerequest.dto.response.ServiceRequestResponse;
import com.trustly.servicerequest.dto.response.nested.CategoryDTO;
import com.trustly.servicerequest.dto.response.nested.CustomerDTO;
import com.trustly.servicerequest.dto.response.nested.WorkerDTO;
import com.trustly.servicerequest.entity.ServiceRequest;
import org.springframework.stereotype.Component;

@Component
public class ServiceRequestMapper {

    public ServiceRequestResponse toResponse(ServiceRequest sr) {

        return ServiceRequestResponse.builder()

                .id(sr.getId())

                .customer(CustomerDTO.builder()
                        .id(sr.getCustomer().getId())
                        .name(sr.getCustomer().getName())
                        .build())

                .worker(WorkerDTO.builder()
                        .profileId(sr.getWorkerProfile().getId())
                        .userId(sr.getWorkerProfile().getWorker().getId())
                        .name(sr.getWorkerProfile().getWorker().getName())
                        .build())

                .category(CategoryDTO.builder()
                        .id(sr.getWorkerProfile().getCategory().getId())
                        .name(sr.getWorkerProfile().getCategory().getName())
                        .build())

                .title(sr.getTitle())
                .description(sr.getDescription())
                .address(sr.getAddress())
                .status(sr.getStatus())

                .requestedAt(sr.getRequestedAt())
                .respondedAt(sr.getRespondedAt())
                .completedAt(sr.getCompletedAt())

                .workerRemark(sr.getWorkerRemark())
                .customerRemark(sr.getCustomerRemark())

                .build();
    }
}