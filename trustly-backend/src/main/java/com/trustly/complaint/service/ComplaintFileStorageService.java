package com.trustly.complaint.service;

import com.cloudinary.Cloudinary;
import com.trustly.common.exception.FileStorageException;
import com.trustly.complaint.dto.response.ComplaintUploadResult;
import com.trustly.complaint.enums.ComplaintEvidenceType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintFileStorageService {

    private final Cloudinary cloudinary;

    private final Set<String> allowedExtensions =
            Set.of(
                    "jpg",
                    "jpeg",
                    "png",
                    "pdf"
            );

    private final Set<String> allowedContentTypes =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "application/pdf"
            );

    public ComplaintUploadResult uploadEvidence(
            MultipartFile file
    ) {

        try {

            validateFile(file);

            String publicId =
                    UUID.randomUUID().toString();

            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            Map.of(
                                    "folder",
                                    "trustly/complaint-evidences",
                                    "public_id",
                                    publicId
                            )
                    );

            return ComplaintUploadResult.builder()
                    .fileUrl(
                            uploadResult.get("secure_url").toString()
                    )
                    .publicId(
                            uploadResult.get("public_id").toString()
                    )
                    .evidenceType(
                            determineType(
                                    file.getContentType()
                            )
                    )
                    .build();

        } catch (IOException ex) {

            throw new FileStorageException(
                    "Failed to upload complaint evidence",
                    ex
            );
        }
    }

    private void validateFile(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            throw new FileStorageException(
                    "Evidence file is required"
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                !originalFileName.contains(".")) {

            throw new FileStorageException(
                    "Invalid file name"
            );
        }

        String extension =
                originalFileName
                        .substring(
                                originalFileName.lastIndexOf(".") + 1
                        )
                        .toLowerCase();

        if (!allowedExtensions.contains(extension)) {

            throw new FileStorageException(
                    "Only jpg, jpeg, png and pdf files are allowed"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !allowedContentTypes.contains(contentType)) {

            throw new FileStorageException(
                    "Invalid file type"
            );
        }
    }

    private ComplaintEvidenceType determineType(
            String contentType
    ) {

        if ("application/pdf".equals(contentType)) {
            return ComplaintEvidenceType.PDF;
        }

        return ComplaintEvidenceType.IMAGE;
    }
}