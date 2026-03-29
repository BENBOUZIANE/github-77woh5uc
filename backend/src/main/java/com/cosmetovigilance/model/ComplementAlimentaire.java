package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "complement_alimentaire")
public class ComplementAlimentaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "numero_declaration", unique = true)
    private String numeroDeclaration;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private DeclarationStatus statut = DeclarationStatus.nouveau;

    @Column(name = "commentaire_anmps", columnDefinition = "TEXT")
    private String commentaireAnmps;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private DeclarantCA declarant;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private ProfessionnelSanteCA professionnelSante;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private RepresentantLegalCA representantLegal;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private PersonneExposeeCA personneExposee;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private EffetIndesirableCA effetIndesirable;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private PriseChargeMedicaleCA priseChargeMedicale;

    @OneToOne(mappedBy = "complementAlimentaire", cascade = CascadeType.ALL)
    private ComplementSuspecte complementSuspecte;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
