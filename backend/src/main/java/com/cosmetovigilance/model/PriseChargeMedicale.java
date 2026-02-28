package com.cosmetovigilance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "prise_charge_medicale")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseChargeMedicale {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "declaration_id", length = 36)
    private String declarationId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnostic;

    @Column(name = "mesures_prise", nullable = false, columnDefinition = "TEXT")
    private String mesuresPrise;

    @Column(name = "examens_realise", nullable = false, columnDefinition = "TEXT")
    private String examensRealise;
}
