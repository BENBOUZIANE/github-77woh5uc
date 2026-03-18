package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "effet_indesirable_ca")
public class EffetIndesirableCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    @Column(columnDefinition = "TEXT")
    private String localisation;

    @Column(name = "description_symptomes", columnDefinition = "TEXT")
    private String descriptionSymptomes;

    @Column(name = "date_apparition")
    private LocalDate dateApparition;

    @Column(name = "delai_survenue")
    private String delaiSurvenue;

    private Boolean gravite;

    @ElementCollection
    @CollectionTable(name = "criteres_gravite_ca", joinColumns = @JoinColumn(name = "effet_indesirable_ca_id"))
    @Column(name = "critere")
    private List<String> criteresGravite;

    @Column(name = "evolution_effet")
    private String evolutionEffet;
}
