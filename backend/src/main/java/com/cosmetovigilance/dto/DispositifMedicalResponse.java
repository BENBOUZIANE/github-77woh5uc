package com.cosmetovigilance.dto;

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
public class DispositifMedicalResponse {
    private Long id;
    private String numeroDeclaration;
    private String statut;
    private String commentaire;
    private String commentaireAnmps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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
