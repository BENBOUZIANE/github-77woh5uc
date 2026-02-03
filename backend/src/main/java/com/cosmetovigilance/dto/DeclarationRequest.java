package com.cosmetovigilance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class DeclarationRequest {
    // Type d'utilisateur: professionnel, representant_legal, particulier, autre
    private String utilisateurType;

    // Optional details based on utilisateurType
    @Valid
    private ProfessionnelSanteDto professionnelSante;

    @Valid
    private RepresentantLegalDto representantLegal;

    @NotNull(message = "Declarant information is required")
    @Valid
    private DeclarantDto declarant;

    @NotNull(message = "Personne exposee information is required")
    @Valid
    private PersonneExposeeDto personneExposee;

    @Valid
    private List<EffetIndesirableDto> effetsIndesirables;

    @Valid
    private List<ProduitSuspecteDto> produitsSuspectes;

    @Valid
    private List<PriseChargeMedicaleDto> prisesChargeMedicales;

    private String commentaire;
}
