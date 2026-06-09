package com.trustly.worker.service;

import com.trustly.common.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;
    private final Set<String> allowedExtentions=
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
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName =
                    file.getOriginalFilename();

            if (originalFileName == null || originalFileName.isBlank()) {
                throw new FileStorageException("Invalid file name");
            }
            if (!originalFileName.contains(".")) {
                throw new FileStorageException(
                        "File must have a valid extension"
                );
            }
            String extension=originalFileName.substring(originalFileName.lastIndexOf(".")+1).toLowerCase();
            if (!allowedExtentions.contains(extension)) {
                throw new FileStorageException("Only jpg, jpeg, png and pdf files are allowed");
            }
            String contentType =
                    file.getContentType();

            if (contentType == null ||
                    !allowedContentTypes.contains(contentType)) {

                throw new FileStorageException(
                        "Invalid file type"
                );
            }
            String sanitizedFileName =
                    originalFileName.replaceAll("\\s+", "_");

            String fileName =
                    UUID.randomUUID() +
                            "-" +
                            sanitizedFileName;

            Path filePath =
                    uploadPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "worker-documents/" + fileName;

        } catch (IOException ex) {

            throw new FileStorageException(
                    "Failed to store document",
                    ex
            );
        }
    }
}