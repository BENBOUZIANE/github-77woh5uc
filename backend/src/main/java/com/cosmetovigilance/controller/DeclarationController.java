package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.ApiResponse;
import com.cosmetovigilance.dto.DeclarationRequest;
import com.cosmetovigilance.dto.DeclarationResponse;
import com.cosmetovigilance.dto.UpdateCommentaireAnmpsRequest;
import com.cosmetovigilance.dto.UpdateDeclarationStatusRequest;
import com.cosmetovigilance.service.DeclarationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/declarations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Declarations", description = "Declaration management APIs")
public class DeclarationController {

    private final DeclarationService declarationService;

    @PostMapping
    @Operation(summary = "Create a new declaration")
    public ResponseEntity<ApiResponse<DeclarationResponse>> createDeclaration(
            @Valid @RequestBody DeclarationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // userDetails may be null for public (unauthenticated) submissions
            String userEmail = userDetails != null ? userDetails.getUsername() : null;
            DeclarationResponse response = declarationService.createDeclaration(request, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Declaration created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get declaration by ID")
    public ResponseEntity<ApiResponse<DeclarationResponse>> getDeclarationById(@PathVariable String id) {
        try {
            DeclarationResponse response = declarationService.getDeclarationById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    @Operation(summary = "Update declaration status (statut)")
    public ResponseEntity<ApiResponse<DeclarationResponse>> updateDeclarationStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateDeclarationStatusRequest request) {
        try {
            DeclarationResponse response = declarationService.updateDeclarationStatus(id, request.getStatut());
            return ResponseEntity.ok(ApiResponse.success("Statut mis à jour", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my-declarations")
    @Operation(summary = "Get current user's declarations")
    public ResponseEntity<ApiResponse<List<DeclarationResponse>>> getMyDeclarations(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<DeclarationResponse> declarations = declarationService.getUserDeclarations(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(declarations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get all declarations")
    public ResponseEntity<ApiResponse<List<DeclarationResponse>>> getAllDeclarations() {
        try {
            List<DeclarationResponse> declarations = declarationService.getAllDeclarations();
            return ResponseEntity.ok(ApiResponse.success(declarations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/commentaire-anmps")
    @Operation(summary = "Update declaration commentaire ANMPS and send email")
    public ResponseEntity<ApiResponse<DeclarationResponse>> updateCommentaireAnmps(
            @PathVariable String id,
            @Valid @RequestBody UpdateCommentaireAnmpsRequest request) {
        try {
            DeclarationResponse response = declarationService.updateCommentaireAnmps(id, request.getCommentaireAnmps());
            return ResponseEntity.ok(ApiResponse.success("Commentaire ANMPS mis à jour et email envoyé", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
