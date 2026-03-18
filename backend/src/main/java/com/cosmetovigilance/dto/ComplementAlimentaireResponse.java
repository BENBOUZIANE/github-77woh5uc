package com.cosmetovigilance.dto;

import com.cosmetovigilance.model.DeclarationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ComplementAlimentaireResponse {
    private Long id;
    private String numeroDeclaration;
    private DeclarationStatus statut;
    private String commentaireAnmps;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private DeclarantCADto declarant;
    private ProfessionnelSanteCADto professionnelSante;
    private RepresentantLegalCADto representantLegal;
    private PersonneExposeeCADto personneExposee;
    private EffetIndesirableCADto effetIndesirable;
    private PriseChargeMedicaleCADto priseChargeMedicale;
    private ComplementSuspecteDto complementSuspecte;
    private String commentaire;
}
