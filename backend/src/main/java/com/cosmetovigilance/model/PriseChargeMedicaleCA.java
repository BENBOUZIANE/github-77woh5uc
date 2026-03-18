package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "prise_charge_medicale_ca")
public class PriseChargeMedicaleCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    @Column(name = "consultation_medicale")
    private Boolean consultationMedicale;

    @Column(name = "diagnostic_medecin", columnDefinition = "TEXT")
    private String diagnosticMedecin;

    @Column(name = "mesures_prise_type")
    private String mesuresPriseType;

    @Column(name = "mesures_prise_autre", columnDefinition = "TEXT")
    private String mesuresPriseAutre;

    @Column(name = "examens_realise", columnDefinition = "TEXT")
    private String examensRealise;
}
