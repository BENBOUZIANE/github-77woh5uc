package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;

@Entity
@Table(name = "personne_exposee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonneExposee {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, name = "nom_prenom")
    private String nomPrenom;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Boolean grossesse = false;

    @Column(name = "mois_grossesse")
    private Integer moisGrossesse;

    @Column(nullable = false)
    private Boolean allaitement = false;

    @Column(nullable = false, length = 1)
    private String sexe;

    @Column(nullable = false, length = 100)
    private String ville;

    @OneToMany(mappedBy = "personneExposeeId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AllergiesConnues> allergies;

    @OneToMany(mappedBy = "personneExposeeId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AntecedentsMedical> antecedents;

    @OneToMany(mappedBy = "personneExposeeId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicamentProduitSimultanement> medicaments;
}
