package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "medicament_produit_simultanement_ca")
public class MedicamentProduitSimultanementCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personne_exposee_ca_id")
    private PersonneExposeeCA personneExposeeCA;

    private String medicament;
}
