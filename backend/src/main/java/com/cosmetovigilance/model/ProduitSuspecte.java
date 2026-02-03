package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "produit_suspecte")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduitSuspecte {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "declaration_id", length = 36)
    private String declarationId;

    @Column(name = "nom_commercial", nullable = false)
    private String nomCommercial;

    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String fabricant;

    @Column(name = "type_produit", nullable = false)
    private String typeProduit;

    @Column(name = "numero_lot", nullable = false)
    private String numeroLot;

    @Column(name = "frequence_utilisation", nullable = false)
    private String frequenceUtilisation;

    @Column(name = "date_debut_utilisation", nullable = false)
    private String dateDebutUtilisation;

    @Column(name = "arret_utilisation", nullable = false)
    private String arretUtilisation;

    @Column(name = "reexposition_produit", nullable = false)
    private Boolean reexpositionProduit = false;

    @Column(name = "reapparition_effet_indesirable", nullable = false)
    private Boolean reapparitionEffetIndesirable = false;
}
