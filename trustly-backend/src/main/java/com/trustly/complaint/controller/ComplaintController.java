package com.trustly.complaint.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustly.complaint.dto.request.CreateComplaintRequest;
import com.trustly.complaint.dto.response.ComplaintDetailsResponse;
import com.trustly.complaint.dto.response.ComplaintResponse;
import com.trustly.complaint.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {
    private final ObjectMapper objectMapper;
    private final ComplaintService complaintService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public ComplaintResponse createComplaint(

            @RequestPart("request")
            String requestJson,

            @RequestPart(
                    value = "evidences",
                    required = false
            )
            List<MultipartFile> evidences
    ) throws JsonProcessingException {

        CreateComplaintRequest request =
                objectMapper.readValue(
                        requestJson,
                        CreateComplaintRequest.class
                );

        return complaintService.createComplaint(
                request,
                evidences
        );
    }
    @GetMapping("/my")
    public List<ComplaintResponse> getMyComplaints() {

        return complaintService.getMyComplaints();
    }

    @GetMapping("/{complaintId}")
    public ComplaintDetailsResponse getComplaint(
            @PathVariable Long complaintId
    ) {

        return complaintService.getComplaint(
                complaintId
        );
    }
}