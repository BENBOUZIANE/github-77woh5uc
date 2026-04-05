package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositifSuspecteDto {
    private String nomCommercial;
    private String marque;
    private String designation;
    private String reference;
    private String modele;
    private String numeroSerie;
    private String numeroLot;
    private String udi;
    private String versionLogiciel;
    private String nomFabricant;
    private String adresseFabricant;
    private String localisationActuelle;
    private Boolean estImplantable;
    private LocalDate dateImplantation;
    private LocalDate dateExplantation;
    private LocalDate dateSurvenue;
}
