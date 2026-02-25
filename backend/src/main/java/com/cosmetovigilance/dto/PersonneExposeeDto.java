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

    @NotBlank(message = "Nom is required")
    private String nom;

    @NotBlank(message = "Prenom is required")
    private String prenom;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 150, message = "Age must be less than 150")
    private Integer age;

    private Boolean grossesse = false;
    private Integer moisGrossesse;
    private Boolean allaitement = false;
    private String email;
    private String tel;

    @NotBlank(message = "Sexe is required")
    private String sexe;

    private List<String> allergies;
    private List<String> antecedents;
    private List<String> medicaments;
}
