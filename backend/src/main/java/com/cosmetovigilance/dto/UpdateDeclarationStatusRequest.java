package com.cosmetovigilance.dto;

import com.cosmetovigilance.model.DeclarationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateDeclarationStatusRequest {
    @NotNull(message = "Statut is required")
    private DeclarationStatus statut;
}

