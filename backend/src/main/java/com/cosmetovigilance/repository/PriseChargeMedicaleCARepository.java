package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PriseChargeMedicaleCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriseChargeMedicaleCARepository extends JpaRepository<PriseChargeMedicaleCA, Long> {
}
