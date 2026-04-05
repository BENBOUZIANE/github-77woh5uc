package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositif_suspecte")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositifSuspecte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dispositif_medical_id", nullable = false)
    private Long dispositifMedicalId;

    @Column(name = "nom_specialite", length = 255)
    private String nomSpecialite;

    @Column(name = "marque", length = 255)
    private String marque;

    @Column(name = "designation", length = 255)
    private String designation;

    @Column(name = "reference", length = 100)
    private String reference;

    @Column(name = "modele", length = 100)
    private String modele;

    @Column(name = "numero_serie", length = 100)
    private String numeroSerie;

    @Column(name = "numero_lot", length = 100)
    private String numeroLot;

    @Column(name = "udi", length = 255)
    private String udi;

    @Column(name = "version_logiciel", length = 100)
    private String versionLogiciel;

    @Column(name = "nom_fabricant", length = 255)
    private String nomFabricant;

    @Column(name = "adresse_fabricant", columnDefinition = "TEXT")
    private String adresseFabricant;

    @Column(name = "localisation_actuelle", length = 255)
    private String localisationActuelle;

    @Column(name = "est_implantable")
    private Boolean estImplantable = false;

    @Column(name = "date_implantation")
    private LocalDate dateImplantation;

    @Column(name = "date_explantation")
    private LocalDate dateExplantation;

    @Column(name = "posologie", columnDefinition = "TEXT")
    private String posologie;

    @Column(name = "date_debut_prise")
    private LocalDate dateDebutPrise;

    @Column(name = "date_arret_prise")
    private LocalDate dateArretPrise;

    @Column(name = "motif_prise", columnDefinition = "TEXT")
    private String motifPrise;

    @Column(name = "lieu_achat", length = 255)
    private String lieuAchat;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
