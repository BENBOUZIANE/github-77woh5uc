package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RepresentantLegalDto {
    private String id;

    @NotBlank(message = "Nom etablissement is required")
    private String nomEtablissement;

    @NotBlank(message = "Numero declaration etablissement is required")
    private String numeroDeclarationEtablissement;

    @NotBlank(message = "Numero document enregistrement produit is required")
    private String numeroDocumentEnregistrementProduit;

    @NotBlank(message = "Date reception notification is required")
    private String dateReceptionNotification;
}

