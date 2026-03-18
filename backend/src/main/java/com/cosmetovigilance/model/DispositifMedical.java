package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositif_medical")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositifMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_declaration", unique = true, length = 50)
    private String numeroDeclaration;

    @Column(name = "statut", length = 20)
    private String statut = "EN_ATTENTE";

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "commentaire_anmps", columnDefinition = "TEXT")
    private String commentaireAnmps;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "declarant_dm_id")
    private DeclarantDM declarant;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "personne_exposee_dm_id")
    private PersonneExposeeDM personneExposee;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "professionnel_sante_dm_id")
    private ProfessionnelSanteDM professionnelSante;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "representant_legal_dm_id")
    private RepresentantLegalDM representantLegal;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
