package com.cosmetovigilance.dto;

import lombok.Data;

@Data
public class ComplementSuspecteDto {
    private String nomSpecialite;
    private String posologie;
    private String numeroLot;
    private String dateDebutPrise;
    private String dateArretPrise;
    private String motifPrise;
    private String lieuAchat;
}
