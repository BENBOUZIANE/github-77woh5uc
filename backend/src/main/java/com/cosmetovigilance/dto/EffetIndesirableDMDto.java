package com.cosmetovigilance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EffetIndesirableDMDto {
    private String description;
    private String localisation;
    private LocalDate dateApparition;
    private String gravite;
    private String evolution;
}
