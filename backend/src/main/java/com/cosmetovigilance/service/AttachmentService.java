package com.cosmetovigilance.service;

import com.cosmetovigilance.model.Attachment;
import com.cosmetovigilance.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public Attachment saveAttachment(MultipartFile file, String declarationId, String userId, String category) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Use a unique filename to avoid collisions
        String storedFileName = java.util.UUID.randomUUID() + fileExtension;
        Path targetLocation = uploadPath.resolve(storedFileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Attachment attachment = new Attachment();
        attachment.setDeclarationId(declarationId);
        attachment.setFile(targetLocation.toString());
        attachment.setFileName(originalFilename);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setUserId(userId);
        attachment.setAttachmentCategory(category);

        return attachmentRepository.save(attachment);
    }
}

