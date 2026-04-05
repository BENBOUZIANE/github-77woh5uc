package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "personne_exposee_dm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonneExposeeDM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", length = 100)
    private String nom;

    @Column(name = "prenom", length = 100)
    private String prenom;

    @Column(name = "type_personne", length = 50)
    private String type;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "age")
    private Integer age;

    @Column(name = "age_unite", length = 20)
    private String ageUnite = "ans";

    @Column(name = "sexe", length = 10)
    private String sexe;

    @Column(name = "poids", precision = 5, scale = 2)
    private BigDecimal poids;

    @Column(name = "taille", precision = 5, scale = 2)
    private BigDecimal taille;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "ville", length = 100)
    private String ville;

    @Column(name = "code_postal", length = 10)
    private String codePostal;

    @Column(name = "grossesse")
    private Boolean grossesse = false;

    @Column(name = "allaitement")
    private Boolean allaitement = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
