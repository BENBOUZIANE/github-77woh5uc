package com.cosmetovigilance.dto;

import lombok.Data;

@Data
public class ComplementSuspecteDto {
    private String nomCommercial;
    private String marque;
    private String fabricant;
    private String numeroLot;
    private String formeGalenique;
    private String posologie;
    private String frequenceUtilisation;
    private String dateDebutUtilisation;
    private String arretUtilisation;
    private Boolean reexpositionProduit;
    private Boolean reapparitionEffetIndesirable;
    private String compositionProduit;
}
