package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionnelSanteDMDto {
    private String nom;
    private String prenom;
    private String specialite;
    private String email;
    private String telephone;
    private String adresse;
    private String etablissement;
    private String ville;
}
