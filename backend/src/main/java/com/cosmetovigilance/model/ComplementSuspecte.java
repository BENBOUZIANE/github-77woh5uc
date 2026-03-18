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

    @Column(name = "nom_specialite")
    private String nomSpecialite;

    @Column(name = "posologie")
    private String posologie;

    @Column(name = "numero_lot")
    private String numeroLot;

    @Column(name = "date_debut_prise")
    private LocalDate dateDebutPrise;

    @Column(name = "date_arret_prise")
    private LocalDate dateArretPrise;

    @Column(name = "motif_prise")
    private String motifPrise;

    @Column(name = "lieu_achat")
    private String lieuAchat;
}
