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
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeDocument(MultipartFile file) {

        try {

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName =
                    file.getOriginalFilename();

            if (originalFileName == null || originalFileName.isBlank()) {
                throw new FileStorageException("Invalid file name");
            }

            String fileName =
                    UUID.randomUUID() +
                            "-" +
                            originalFileName;

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