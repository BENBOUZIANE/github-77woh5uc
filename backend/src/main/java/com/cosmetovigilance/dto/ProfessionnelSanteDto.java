package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfessionnelSanteDto {
    private String id;

    @NotBlank(message = "Profession is required")
    private String profession;

    @NotBlank(message = "Structure is required")
    private String structure;

    @NotBlank(message = "Ville is required")
    private String ville;
}

