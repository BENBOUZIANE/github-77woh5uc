package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicament_produit_simultanement_dm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentProduitSimultanementDM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "personne_exposee_dm_id", nullable = false)
    private Long personneExposeeDmId;

    @Column(name = "nom", length = 255)
    private String nom;

    @Column(name = "posologie", columnDefinition = "TEXT")
    private String posologie;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
