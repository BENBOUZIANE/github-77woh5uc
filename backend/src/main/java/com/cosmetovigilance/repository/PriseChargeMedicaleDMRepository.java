package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PriseChargeMedicaleDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PriseChargeMedicaleDMRepository extends JpaRepository<PriseChargeMedicaleDM, Long> {
    List<PriseChargeMedicaleDM> findByDispositifMedicalId(Long dispositifMedicalId);
}
