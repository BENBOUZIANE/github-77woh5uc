package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "professionnel_sante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionnelSante {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "utilisateur_id", length = 36)
    private String utilisateurId;

    @Column(nullable = false)
    private String profession;

    @Column(nullable = false)
    private String structure;

    @Column(nullable = false)
    private String ville;
}
