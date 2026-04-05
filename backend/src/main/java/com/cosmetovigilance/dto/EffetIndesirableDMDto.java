package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EffetIndesirableDMDto {
    private String descriptionIncident;
    private String nombreDM;
    private LocalDate dateSurvenue;
    private String consequencesCliniques;
    private String structureSurvenue;
    private String adresseSurvenue;
    private String gravite;
    // legacy fields kept for compatibility
    private String description;
    private String localisation;
    private LocalDate dateApparition;
    private String evolution;
}
