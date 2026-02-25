package com.cosmetovigilance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PersonneExposeeDto {
    private String id;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Nom/Prenom is required")
    private String nomPrenom;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 150, message = "Age must be less than 150")
    private Integer age;

    private Boolean grossesse = false;

    @Min(value = 0, message = "Mois de grossesse must be at least 0")
    @Max(value = 10, message = "Mois de grossesse must be at most 10")
    private Integer moisGrossesse;

    private Boolean allaitement = false;

    @NotBlank(message = "Sexe is required")
    private String sexe;

    @NotBlank(message = "Ville is required")
    private String ville;

    private List<String> allergies;
    private List<String> antecedents;
    private List<String> medicaments;
}
