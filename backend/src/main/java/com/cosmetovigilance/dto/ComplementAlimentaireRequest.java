package com.cosmetovigilance.dto;

import lombok.Data;
import java.util.List;

@Data
public class ComplementAlimentaireRequest {
    private String utilisateurType;
    private String utilisateurTypeAutre;
    private ProfessionnelSanteCADto professionnelSante;
    private RepresentantLegalCADto representantLegal;
    private DeclarantCADto declarant;
    private PersonneExposeeCADto personneExposee;
    private List<String> allergiesConnues;
    private List<String> antecedentsMedicaux;
    private List<String> medicamentsSimultanes;
    private EffetIndesirableCADto effetIndesirable;
    private PriseChargeMedicaleCADto priseChargeMedicale;
    private ComplementSuspecteDto complementSuspecte;
    private String commentaire;
}
