package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "declarant_ca")
public class DeclarantCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    @Column(name = "utilisateur_type")
    private String utilisateurType;

    @Column(name = "utilisateur_type_autre")
    private String utilisateurTypeAutre;

    private String nom;
    private String prenom;
    private String email;
    private String tel;
}
