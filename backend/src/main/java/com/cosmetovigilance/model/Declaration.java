package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "declaration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Declaration {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "declarant_id", length = 36)
    private String declarantId;

    @Column(name = "personne_exposee_id", length = 36)
    private String personneExposeeId;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "statut",
            nullable = false,
            columnDefinition = "ENUM('nouveau','en_cours','traite','rejete','cloture')"
    )
    private DeclarationStatus statut;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "declarationId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EffetIndesirable> effetsIndesirables;

    @OneToMany(mappedBy = "declarationId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProduitSuspecte> produitsSuspectes;

    @OneToMany(mappedBy = "declarationId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PriseChargeMedicale> prisesChargeMedicales;

    @OneToMany(mappedBy = "declarationId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (statut == null) {
            statut = DeclarationStatus.nouveau;
        }
    }
}
