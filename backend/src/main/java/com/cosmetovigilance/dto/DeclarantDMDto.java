package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclarantDMDto {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String qualiteDeclarant;
}
