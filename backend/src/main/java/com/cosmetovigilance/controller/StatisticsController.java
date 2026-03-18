package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.ApiResponse;
import com.cosmetovigilance.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@CrossOrigin(origins = "*")
@Tag(name = "Statistiques", description = "API pour les statistiques avancées du dashboard")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/age-gravite")
    @Operation(summary = "Statistiques par tranche d'âge et gravité")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByAgeAndGravite() {
        Map<String, Object> stats = statisticsService.getStatsByAgeAndGravite();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/sexe-gravite")
    @Operation(summary = "Statistiques par sexe et gravité")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsBySexeAndGravite() {
        Map<String, Object> stats = statisticsService.getStatsBySexeAndGravite();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/notifiant-gravite")
    @Operation(summary = "Statistiques par qualité du notifiant et gravité")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByNotifiantAndGravite() {
        Map<String, Object> stats = statisticsService.getStatsByNotifiantAndGravite();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/criteres-gravite")
    @Operation(summary = "Nombre d'EIG par critères de gravité")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByCriteresGravite() {
        Map<String, Object> stats = statisticsService.getStatsByCriteresGravite();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/type-produit-gravite")
    @Operation(summary = "Statistiques par type de produit et gravité")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByTypeProduitAndGravite() {
        Map<String, Object> stats = statisticsService.getStatsByTypeProduitAndGravite();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/classification")
    @Operation(summary = "Répartition des déclarations selon leur classification")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByClassification() {
        Map<String, Object> stats = statisticsService.getStatsByClassification();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(stats)
                .build());
    }

    @GetMapping("/all")
    @Operation(summary = "Toutes les statistiques en une seule requête")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllStatistics() {
        Map<String, Object> allStats = statisticsService.getAllStatistics();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .data(allStats)
                .build());
    }
}
