package com.cosmetovigilance.dto;

import lombok.Data;
import java.util.List;

@Data
public class EffetIndesirableCADto {
    private String localisation;
    private String descriptionSymptomes;
    private String dateApparition;
    private String delaiSurvenue;
    private Boolean gravite;
    private List<String> criteresGravite;
    private String evolutionEffet;
}
