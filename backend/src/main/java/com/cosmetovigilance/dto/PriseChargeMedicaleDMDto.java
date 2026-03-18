package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseChargeMedicaleDMDto {
    private Boolean hospitalisationRequise;
    private Integer dureeHospitalisation;
    private String traitementMedical;
    private String examensComplementaires;
}
