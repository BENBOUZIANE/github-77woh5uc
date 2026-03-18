package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "representant_legal_ca")
public class RepresentantLegalCA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "complement_alimentaire_id")
    private ComplementAlimentaire complementAlimentaire;

    @Column(name = "nom_etablissement")
    private String nomEtablissement;

    @Column(name = "numero_declaration_etablissement")
    private String numeroDeclarationEtablissement;

    @Column(name = "numero_document_enregistrement_produit")
    private String numeroDocumentEnregistrementProduit;

    @Column(name = "date_reception_notification")
    private LocalDate dateReceptionNotification;

    @Column(name = "document_enregistrement_path")
    private String documentEnregistrementPath;
}
