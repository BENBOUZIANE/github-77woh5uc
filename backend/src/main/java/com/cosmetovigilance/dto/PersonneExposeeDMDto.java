package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonneExposeeDMDto {
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private Integer age;
    private String ageUnite;
    private String sexe;
    private BigDecimal poids;
    private BigDecimal taille;
    private String email;
    private String telephone;
    private String adresse;
    private String ville;
    private String codePostal;
    private Boolean grossesse;
    private Boolean allaitement;
}
