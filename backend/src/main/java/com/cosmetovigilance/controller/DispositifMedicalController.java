package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.ApiResponse;
import com.cosmetovigilance.dto.DispositifMedicalRequest;
import com.cosmetovigilance.dto.DispositifMedicalResponse;
import com.cosmetovigilance.dto.UpdateCommentaireAnmpsRequest;
import com.cosmetovigilance.dto.UpdateDeclarationStatusRequest;
import com.cosmetovigilance.service.DispositifMedicalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispositif-medical")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Matériovigilance", description = "API de gestion des déclarations de matériovigilance (dispositifs médicaux)")
public class DispositifMedicalController {

    private final DispositifMedicalService dispositifMedicalService;

    @PostMapping
    @Operation(summary = "Créer une nouvelle déclaration de matériovigilance")
    public ResponseEntity<ApiResponse<DispositifMedicalResponse>> createDeclaration(
            @RequestBody DispositifMedicalRequest request,
            Authentication authentication) {
        try {
            String userEmail = (authentication != null) ? authentication.getName() : null;
            DispositifMedicalResponse response = dispositifMedicalService.createDeclaration(request, userEmail);
            return ResponseEntity.ok(ApiResponse.<DispositifMedicalResponse>builder()
                    .success(true)
                    .message("Déclaration créée avec succès")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating dispositif medical declaration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<DispositifMedicalResponse>builder()
                            .success(false)
                            .message("Erreur lors de la création de la déclaration: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/my-declarations")
    @Operation(summary = "Récupérer les déclarations de l'utilisateur connecté")
    public ResponseEntity<ApiResponse<List<DispositifMedicalResponse>>> getMyDeclarations(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<DispositifMedicalResponse> declarations = dispositifMedicalService.getDeclarationsByUser(userEmail);
            return ResponseEntity.ok(ApiResponse.<List<DispositifMedicalResponse>>builder()
                    .success(true)
                    .message("Déclarations récupérées avec succès")
                    .data(declarations)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user declarations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<DispositifMedicalResponse>>builder()
                            .success(false)
                            .message("Erreur lors de la récupération des déclarations: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer toutes les déclarations (Admin uniquement)")
    public ResponseEntity<ApiResponse<List<DispositifMedicalResponse>>> getAllDeclarations() {
        try {
            List<DispositifMedicalResponse> declarations = dispositifMedicalService.getAllDeclarations();
            return ResponseEntity.ok(ApiResponse.<List<DispositifMedicalResponse>>builder()
                    .success(true)
                    .message("Toutes les déclarations récupérées avec succès")
                    .data(declarations)
                    .build());
        } catch (Exception e) {
            log.error("Error getting all declarations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<DispositifMedicalResponse>>builder()
                            .success(false)
                            .message("Erreur lors de la récupération des déclarations: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une déclaration par ID")
    public ResponseEntity<ApiResponse<DispositifMedicalResponse>> getDeclarationById(@PathVariable Long id) {
        try {
            DispositifMedicalResponse declaration = dispositifMedicalService.getDeclarationById(id);
            return ResponseEntity.ok(ApiResponse.<DispositifMedicalResponse>builder()
                    .success(true)
                    .message("Déclaration récupérée avec succès")
                    .data(declaration)
                    .build());
        } catch (Exception e) {
            log.error("Error getting declaration by id", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<DispositifMedicalResponse>builder()
                            .success(false)
                            .message("Déclaration non trouvée: " + e.getMessage())
                            .build());
        }
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour le statut d'une déclaration (Admin uniquement)")
    public ResponseEntity<ApiResponse<DispositifMedicalResponse>> updateStatut(
            @PathVariable Long id,
            @RequestBody UpdateDeclarationStatusRequest request) {
        try {
            DispositifMedicalResponse declaration = dispositifMedicalService.updateStatut(id, request.getStatut().name());
            return ResponseEntity.ok(ApiResponse.<DispositifMedicalResponse>builder()
                    .success(true)
                    .message("Statut mis à jour avec succès")
                    .data(declaration)
                    .build());
        } catch (Exception e) {
            log.error("Error updating declaration status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<DispositifMedicalResponse>builder()
                            .success(false)
                            .message("Erreur lors de la mise à jour du statut: " + e.getMessage())
                            .build());
        }
    }

    @PutMapping("/{id}/commentaire-anmps")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ajouter un commentaire ANMPS (Admin uniquement)")
    public ResponseEntity<ApiResponse<DispositifMedicalResponse>> updateCommentaireAnmps(
            @PathVariable Long id,
            @RequestBody UpdateCommentaireAnmpsRequest request) {
        try {
            DispositifMedicalResponse declaration = dispositifMedicalService.updateCommentaireAnmps(id, request.getCommentaireAnmps());
            return ResponseEntity.ok(ApiResponse.<DispositifMedicalResponse>builder()
                    .success(true)
                    .message("Commentaire ANMPS ajouté avec succès")
                    .data(declaration)
                    .build());
        } catch (Exception e) {
            log.error("Error updating commentaire ANMPS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<DispositifMedicalResponse>builder()
                            .success(false)
                            .message("Erreur lors de l'ajout du commentaire: " + e.getMessage())
                            .build());
        }
    }
}
