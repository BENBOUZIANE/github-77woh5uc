package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "representant_legal")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepresentantLegal {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "professionnel_sante_id", length = 36)
    private String professionnelSanteId;

    @Column(nullable = false)
    private String nomEtablissement;

    @Column(nullable = false)
    private String numeroDeclarationEtablissement;

    @Column(nullable = false)
    private String numeroDocumentEnregistrementProduit;

    @Column(nullable = false)
    private String dateReceptionNotification;

    @Column(columnDefinition = "TEXT")
    private String documentEnregistrement;
}
