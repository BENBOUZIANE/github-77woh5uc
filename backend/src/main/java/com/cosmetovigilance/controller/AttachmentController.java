package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.ApiResponse;
import com.cosmetovigilance.model.Attachment;
import com.cosmetovigilance.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
// Upload is allowed for public form submissions too; dashboard usage still requires JWT via security config
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attachments", description = "File attachment management APIs")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file attachment")
    public ResponseEntity<ApiResponse<Attachment>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "declarationId", required = false) String declarationId,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // userDetails may be null for public (unauthenticated) submissions
            String userId = userDetails != null ? userDetails.getUsername() : null;
            Attachment attachment = attachmentService.saveAttachment(file, declarationId, userId, category);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("File uploaded successfully", attachment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }
}

