package com.trustly.workerprofile.service;

import com.trustly.workerprofile.dto.response.WorkerSearchResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface WorkerSearchService {

    Page<WorkerSearchResponse> searchWorkers(
            Long category,
            String city,
            String state,
            BigDecimal minimumRating,
            String sort,
            int page,
            int size
    );
}
