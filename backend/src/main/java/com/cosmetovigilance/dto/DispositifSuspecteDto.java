package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositifSuspecteDto {
    private String nomSpecialite;
    private String posologie;
    private String numeroLot;
    private LocalDate dateDebutPrise;
    private LocalDate dateArretPrise;
    private String motifPrise;
    private String lieuAchat;
}
