package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "effet_indesirable_dm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EffetIndesirableDM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dispositif_medical_id", nullable = false)
    private Long dispositifMedicalId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "localisation", length = 255)
    private String localisation;

    @Column(name = "date_apparition")
    private LocalDate dateApparition;

    @Column(name = "gravite", length = 50)
    private String gravite;

    @Column(name = "evolution", length = 100)
    private String evolution;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
