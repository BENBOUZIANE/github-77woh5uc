package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProduitSuspecteDto {
    private String id;

    @NotBlank(message = "Nom commercial is required")
    private String nomCommercial;

    @NotBlank(message = "Marque is required")
    private String marque;

    @NotBlank(message = "Fabricant is required")
    private String fabricant;

    @NotBlank(message = "Type produit is required")
    private String typeProduit;

    @NotBlank(message = "Numero lot is required")
    private String numeroLot;

    @NotBlank(message = "Frequence utilisation is required")
    private String frequenceUtilisation;

    @NotBlank(message = "Date debut utilisation is required")
    private String dateDebutUtilisation;

    @NotBlank(message = "Arret utilisation is required")
    private String arretUtilisation;

    @NotNull(message = "Reexposition produit is required")
    private Boolean reexpositionProduit = false;

    @NotNull(message = "Reapparition effet indesirable is required")
    private Boolean reapparitionEffetIndesirable = false;
}
