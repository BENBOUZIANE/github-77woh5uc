package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "personne_exposee_ca")
public class PersonneExposeeCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    private String type;

    @Column(name = "nom_prenom")
    private String nomPrenom;

    @Column(name = "date_naissance")
    private String dateNaissance;

    private Integer age;

    @Column(name = "age_unite")
    private String ageUnite;

    private Boolean grossesse;

    @Column(name = "mois_grossesse")
    private Integer moisGrossesse;

    private Boolean allaitement;
    private String sexe;
    private String ville;

    @OneToMany(mappedBy = "personneExposeeCA", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AllergiesConnuesCA> allergiesConnues;

    @OneToMany(mappedBy = "personneExposeeCA", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AntecedentsMedicalCA> antecedentsMedicaux;

    @OneToMany(mappedBy = "personneExposeeCA", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicamentProduitSimultanementCA> medicamentsSimultanes;
}
