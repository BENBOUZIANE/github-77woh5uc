package com.cosmetovigilance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PriseChargeMedicaleDto {
    private String id;

    @NotBlank(message = "Diagnostic is required")
    private String diagnostic;

    @NotBlank(message = "Mesures prise is required")
    private String mesuresPrise;

    @NotBlank(message = "Examens realise is required")
    private String examensRealise;
}
