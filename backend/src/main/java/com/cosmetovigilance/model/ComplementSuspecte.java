package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "complement_suspecte")
public class ComplementSuspecte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    @Column(name = "nom_commercial")
    private String nomCommercial;

    private String marque;
    private String fabricant;

    @Column(name = "numero_lot")
    private String numeroLot;

    @Column(name = "forme_galenique")
    private String formeGalenique;

    @Column(name = "posologie")
    private String posologie;

    @Column(name = "frequence_utilisation")
    private String frequenceUtilisation;

    @Column(name = "date_debut_utilisation")
    private LocalDate dateDebutUtilisation;

    @Column(name = "arret_utilisation")
    private String arretUtilisation;

    @Column(name = "reexposition_produit")
    private Boolean reexpositionProduit;

    @Column(name = "reapparition_effet_indesirable")
    private Boolean reapparitionEffetIndesirable;

    @Column(name = "composition_produit", columnDefinition = "TEXT")
    private String compositionProduit;
}
