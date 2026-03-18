package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositifMedicalRequest {
    private String commentaire;
    private DeclarantDMDto declarant;
    private PersonneExposeeDMDto personneExposee;
    private List<DispositifSuspecteDto> dispositifsSuspectes;
    private List<EffetIndesirableDMDto> effetsIndesirables;
    private PriseChargeMedicaleDMDto priseChargeMedicale;
    private ProfessionnelSanteDMDto professionnelSante;
    private RepresentantLegalDMDto representantLegal;
    private List<AllergiesConnuesDMDto> allergies;
    private List<AntecedentsMedicalDMDto> antecedents;
    private List<MedicamentProduitSimultanementDMDto> medicamentsSimultanes;
}
