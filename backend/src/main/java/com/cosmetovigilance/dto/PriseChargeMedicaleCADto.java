package com.cosmetovigilance.dto;

import lombok.Data;

@Data
public class PriseChargeMedicaleCADto {
    private Boolean consultationMedicale;
    private String diagnosticMedecin;
    private String mesuresPriseType;
    private String mesuresPriseAutre;
    private String examensRealise;
}
