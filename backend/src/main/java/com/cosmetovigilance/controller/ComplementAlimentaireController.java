package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.*;
import com.cosmetovigilance.model.DeclarationStatus;
import com.cosmetovigilance.model.User;
import com.cosmetovigilance.security.JwtTokenProvider;
import com.cosmetovigilance.service.ComplementAlimentaireService;
import com.cosmetovigilance.service.CustomUserDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complements-alimentaires")
@RequiredArgsConstructor
@Tag(name = "Compléments Alimentaires", description = "API de gestion des déclarations de compléments alimentaires")
public class ComplementAlimentaireController {

    private final ComplementAlimentaireService complementAlimentaireService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Créer une nouvelle déclaration de complément alimentaire")
    public ResponseEntity<ApiResponse<ComplementAlimentaireResponse>> createDeclaration(
            @RequestHeader("Authorization") String token,
            @RequestPart("data") ComplementAlimentaireRequest request,
            @RequestPart(value = "documentEnregistrement", required = false) MultipartFile documentEnregistrement) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.substring(7));
            User user = (User) userDetailsService.loadUserByUsername(username);
            ComplementAlimentaireResponse response = complementAlimentaireService.createDeclaration(request, user, documentEnregistrement);
            return ResponseEntity.ok(ApiResponse.<ComplementAlimentaireResponse>builder()
                    .success(true)
                    .message("Déclaration créée avec succès")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ComplementAlimentaireResponse>builder()
                    .success(false)
                    .message("Erreur lors de la création de la déclaration: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/mes-declarations")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtenir les déclarations de l'utilisateur connecté")
    public ResponseEntity<ApiResponse<List<ComplementAlimentaireResponse>>> getUserDeclarations(
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.substring(7));
            User user = (User) userDetailsService.loadUserByUsername(username);
            List<ComplementAlimentaireResponse> declarations = complementAlimentaireService.getUserDeclarations(user);
            return ResponseEntity.ok(ApiResponse.<List<ComplementAlimentaireResponse>>builder()
                    .success(true)
                    .message("Déclarations récupérées avec succès")
                    .data(declarations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<ComplementAlimentaireResponse>>builder()
                    .success(false)
                    .message("Erreur lors de la récupération des déclarations: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ANMPS')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtenir toutes les déclarations (ANMPS seulement)")
    public ResponseEntity<ApiResponse<List<ComplementAlimentaireResponse>>> getAllDeclarations() {
        try {
            List<ComplementAlimentaireResponse> declarations = complementAlimentaireService.getAllDeclarations();
            return ResponseEntity.ok(ApiResponse.<List<ComplementAlimentaireResponse>>builder()
                    .success(true)
                    .message("Déclarations récupérées avec succès")
                    .data(declarations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<ComplementAlimentaireResponse>>builder()
                    .success(false)
                    .message("Erreur lors de la récupération des déclarations: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtenir une déclaration par ID")
    public ResponseEntity<ApiResponse<ComplementAlimentaireResponse>> getDeclarationById(@PathVariable Long id) {
        try {
            ComplementAlimentaireResponse declaration = complementAlimentaireService.getDeclarationById(id);
            return ResponseEntity.ok(ApiResponse.<ComplementAlimentaireResponse>builder()
                    .success(true)
                    .message("Déclaration récupérée avec succès")
                    .data(declaration)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ComplementAlimentaireResponse>builder()
                    .success(false)
                    .message("Erreur lors de la récupération de la déclaration: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ANMPS')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Mettre à jour le statut d'une déclaration (ANMPS seulement)")
    public ResponseEntity<ApiResponse<Void>> updateStatut(
            @PathVariable Long id,
            @RequestBody UpdateDeclarationStatusRequest request) {
        try {
            complementAlimentaireService.updateStatut(id, request.getStatut());
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Statut mis à jour avec succès")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Erreur lors de la mise à jour du statut: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}/commentaire-anmps")
    @PreAuthorize("hasRole('ANMPS')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Mettre à jour le commentaire ANMPS d'une déclaration (ANMPS seulement)")
    public ResponseEntity<ApiResponse<Void>> updateCommentaireAnmps(
            @PathVariable Long id,
            @RequestBody UpdateCommentaireAnmpsRequest request) {
        try {
            complementAlimentaireService.updateCommentaireAnmps(id, request.getCommentaire());
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Commentaire mis à jour avec succès")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Erreur lors de la mise à jour du commentaire: " + e.getMessage())
                    .build());
        }
    }
}
