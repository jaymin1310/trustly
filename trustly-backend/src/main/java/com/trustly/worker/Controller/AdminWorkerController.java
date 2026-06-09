package com.trustly.worker.Controller;
import com.trustly.common.enums.WorkerApplicationStatus;
import com.trustly.common.response.SuccessResponse;
import com.trustly.worker.dto.request.ReviewWorkerRequest;
import com.trustly.worker.dto.response.WorkerApplicationDetailResponse;
import com.trustly.worker.dto.response.WorkerApplicationResponse;
import com.trustly.worker.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/worker-applications")
@RequiredArgsConstructor
public class AdminWorkerController {
    private final WorkerService workerService;
    @GetMapping
    public ResponseEntity<Page<WorkerApplicationResponse>> getApplications(

            @RequestParam(required = false)
            WorkerApplicationStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return ResponseEntity.ok(
                workerService.getApplications(
                        status,
                        page,
                        size
                )
        );
    }
    @GetMapping("/{applicationId}")
    public ResponseEntity<WorkerApplicationDetailResponse>
    getApplicationById(
            @PathVariable Long applicationId
    ) {

        return ResponseEntity.ok(
                workerService.getApplicationById(
                        applicationId
                )
        );
    }
    @PatchMapping("/{applicationId}/approve")
    public ResponseEntity<SuccessResponse> approve(
            @PathVariable Long applicationId
    ) {

        workerService.approve(
                applicationId
        );

        return ResponseEntity.ok(
                new SuccessResponse(
                        true,
                        "Worker application approved successfully"
                )
        );
    }
    @PatchMapping("/{applicationId}/reject")
    public ResponseEntity<SuccessResponse> reject(
            @PathVariable Long applicationId,
            @Valid @RequestBody ReviewWorkerRequest request
    ) {

        workerService.reject(
                applicationId,
                request
        );

        return ResponseEntity.ok(
                new SuccessResponse(
                        true,
                        "Worker application rejected successfully"
                )
        );
    }
}
