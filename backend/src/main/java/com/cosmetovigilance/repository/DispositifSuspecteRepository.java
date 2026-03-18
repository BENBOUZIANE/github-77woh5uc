package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.DispositifSuspecte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DispositifSuspecteRepository extends JpaRepository<DispositifSuspecte, Long> {
    List<DispositifSuspecte> findByDispositifMedicalId(Long dispositifMedicalId);
}
