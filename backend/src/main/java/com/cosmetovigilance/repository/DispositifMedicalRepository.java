package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.DispositifMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DispositifMedicalRepository extends JpaRepository<DispositifMedical, Long> {
    List<DispositifMedical> findByUserId(Long userId);
    List<DispositifMedical> findByStatut(String statut);
    List<DispositifMedical> findByUserIdOrderByCreatedAtDesc(Long userId);
}
