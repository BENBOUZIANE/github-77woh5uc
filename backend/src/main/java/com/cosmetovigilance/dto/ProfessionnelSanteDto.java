package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfessionnelSanteDto {
    private String id;

    @NotBlank(message = "Profession is required")
    private String profession;

    private String structure;

    private String ville;
}

