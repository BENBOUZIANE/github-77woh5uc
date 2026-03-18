package com.cosmetovigilance.dto;

import lombok.Data;
import java.util.List;

@Data
public class PersonneExposeeCADto {
    private String type;
    private String nomPrenom;
    private String dateNaissance;
    private Integer age;
    private String ageUnite;
    private Boolean grossesse;
    private Integer moisGrossesse;
    private Boolean allaitement;
    private String sexe;
    private String ville;
    private List<String> allergiesConnues;
    private List<String> antecedentsMedicaux;
    private List<String> medicamentsSimultanes;
}
