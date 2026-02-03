package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;

@Entity
@Table(name = "effet_indesirable")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EffetIndesirable {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "declaration_id", length = 36)
    private String declarationId;

    @Column(nullable = false)
    private String localisation;

    @Column(name = "date_apparition", nullable = false)
    private LocalDate dateApparition;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(nullable = false)
    private Boolean gravite = false;

    @Column(name = "criteres_gravite", columnDefinition = "TEXT")
    private String criteresGravite;

    @Column(name = "evolution_effet", nullable = false, length = 100)
    private String evolutionEffet;
}
