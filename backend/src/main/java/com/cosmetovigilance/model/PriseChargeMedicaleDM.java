package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "prise_charge_medicale_dm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseChargeMedicaleDM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dispositif_medical_id", nullable = false)
    private Long dispositifMedicalId;

    @Column(name = "hospitalisation_requise")
    private Boolean hospitalisationRequise = false;

    @Column(name = "duree_hospitalisation")
    private Integer dureeHospitalisation;

    @Column(name = "traitement_medical", columnDefinition = "TEXT")
    private String traitementMedical;

    @Column(name = "examens_complementaires", columnDefinition = "TEXT")
    private String examensComplementaires;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
