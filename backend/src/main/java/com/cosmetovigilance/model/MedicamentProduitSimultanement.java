package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "medicament_produit_simultanement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentProduitSimultanement {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "personne_exposee_id", length = 36)
    private String personneExposeeId;

    @Column(nullable = false)
    private String label;
}
