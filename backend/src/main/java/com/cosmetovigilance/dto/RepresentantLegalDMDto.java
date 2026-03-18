package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepresentantLegalDMDto {
    private String nom;
    private String prenom;
    private String lienParente;
    private String email;
    private String telephone;
    private String adresse;
}
