package com.cosmetovigilance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeclarantDto {
    private String id;

    @NotBlank(message = "Nom is required")
    private String nom;

    @NotBlank(message = "Prenom is required")
    private String prenom;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Tel is required")
    private String tel;

    private String utilisateurId;
}
