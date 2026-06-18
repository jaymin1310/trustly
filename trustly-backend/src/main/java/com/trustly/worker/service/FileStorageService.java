package com.trustly.worker.service;

import com.cloudinary.Cloudinary;
import com.trustly.common.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

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

    public String storeDocument(MultipartFile file) {

        try {

            if (file == null || file.isEmpty()) {
                throw new FileStorageException(
                        "Document is required"
                );
            }

            String originalFileName =
                    file.getOriginalFilename();

            if (originalFileName == null ||
                    originalFileName.isBlank()) {

                throw new FileStorageException(
                        "Invalid file name"
                );
            }

            if (!originalFileName.contains(".")) {
                throw new FileStorageException(
                        "File must have a valid extension"
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

            String publicId =
                    UUID.randomUUID().toString();

            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            Map.of(
                                    "folder",
                                    "trustly/worker-documents",
                                    "public_id",
                                    publicId
                            )
                    );
            System.out.println("UPLOAD RESULT: " + uploadResult);
            return uploadResult
                    .get("secure_url")
                    .toString();

        } catch (IOException ex) {

            throw new FileStorageException(
                    "Failed to store document",
                    ex
            );
        }
    }
}