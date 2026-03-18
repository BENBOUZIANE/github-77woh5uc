package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "professionnel_sante_dm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionnelSanteDM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", length = 100)
    private String nom;

    @Column(name = "prenom", length = 100)
    private String prenom;

    @Column(name = "specialite", length = 100)
    private String specialite;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "etablissement", length = 255)
    private String etablissement;

    @Column(name = "ville", length = 100)
    private String ville;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
