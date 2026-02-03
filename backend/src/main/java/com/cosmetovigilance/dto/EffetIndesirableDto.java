package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EffetIndesirableDto {
    private String id;

    @NotBlank(message = "Localisation is required")
    private String localisation;

    @NotNull(message = "Date apparition is required")
    private LocalDate dateApparition;

    private LocalDate dateFin;

    @NotNull(message = "Gravite is required")
    private Boolean gravite = false;

    private String criteresGravite;

    @NotBlank(message = "Evolution effet is required")
    private String evolutionEffet;
}
