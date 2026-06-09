package com.trustly.worker.Controller;

import com.trustly.common.response.SuccessResponse;
import com.trustly.worker.dto.request.ApplyWorkerRequest;
import com.trustly.worker.dto.response.MyWorkerApplicationResponse;
import com.trustly.worker.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {
    private final WorkerService workerService;

    @PostMapping(
            value = "/apply",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<SuccessResponse> apply(
            @Valid @ModelAttribute ApplyWorkerRequest request,
            @RequestPart("document") MultipartFile document
    ) {
        workerService.apply(
                request,
                document
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new SuccessResponse(
                                true,
                                "Worker application submitted successfully"
                        )
                );
    }
    @GetMapping("/my-application")
    public ResponseEntity<MyWorkerApplicationResponse> getMyApplication() {
        return ResponseEntity.ok(
                workerService.getMyApplication()
        );
    }

}
