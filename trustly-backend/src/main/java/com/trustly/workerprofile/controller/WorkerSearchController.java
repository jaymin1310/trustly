package com.trustly.workerprofile.controller;

import com.trustly.complaint.repository.WorkerPenaltyRepository;
import com.trustly.workerprofile.dto.response.WorkerSearchResponse;
import com.trustly.workerprofile.service.WorkerSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/workers")
@RequiredArgsConstructor
public class WorkerSearchController {

    private final WorkerSearchService workerSearchService;
    private final WorkerPenaltyRepository workerPenaltyRepository;

    @GetMapping
    public Page<WorkerSearchResponse> searchWorkers(
            @RequestParam(required = false)
            Long category,

            @RequestParam(required = false)
            String city,

            @RequestParam(required = false)
            String state,

            @RequestParam(required = false)
            BigDecimal minimumRating,

            @RequestParam(required = false)
            String sort,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return workerSearchService.searchWorkers(
                category,
                city,
                state,
                minimumRating,
                sort,
                page,
                size
        );
    }
}
