package com.trustly.servicerequest.dto.response;

import com.trustly.common.enums.ServiceRequestStatus;
import com.trustly.servicerequest.dto.response.nested.CustomerDTO;
import com.trustly.servicerequest.dto.response.nested.WorkerDTO;
import com.trustly.servicerequest.dto.response.nested.CategoryDTO;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ServiceRequestResponse {

    private Long id;

    private CustomerDTO customer;
    private WorkerDTO worker;
    private CategoryDTO category;

    private String title;
    private String description;
    private String address;

    private ServiceRequestStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;

    private String workerRemark;
    private String customerRemark;
}