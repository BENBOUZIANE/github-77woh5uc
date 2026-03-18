package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "professionnel_sante_ca")
public class ProfessionnelSanteCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    private String profession;

    @Column(name = "profession_autre")
    private String professionAutre;

    private String structure;
    private String ville;
}
