package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PriseChargeMedicale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriseChargeMedicaleRepository extends JpaRepository<PriseChargeMedicale, String> {
    List<PriseChargeMedicale> findByDeclarationId(String declarationId);
}
