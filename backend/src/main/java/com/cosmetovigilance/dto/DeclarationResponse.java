package com.cosmetovigilance.dto;

import com.cosmetovigilance.model.DeclarationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeclarationResponse {
    private String id;
    private DeclarationStatus statut;
    private DeclarantDto declarant;
    private PersonneExposeeDto personneExposee;
    // Type d'utilisateur: professionnel, representant_legal, particulier, autre
    private String utilisateurType;
    private ProfessionnelSanteDto professionnelSante;
    private RepresentantLegalDto representantLegal;
    private List<EffetIndesirableDto> effetsIndesirables;
    private List<ProduitSuspecteDto> produitsSuspectes;
    private List<PriseChargeMedicaleDto> prisesChargeMedicales;
    private String commentaire;
    private String userId;
    private LocalDateTime createdAt;
}
