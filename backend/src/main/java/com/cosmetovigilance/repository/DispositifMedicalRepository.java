package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.DispositifMedical;
import com.cosmetovigilance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DispositifMedicalRepository extends JpaRepository<DispositifMedical, Long> {
    List<DispositifMedical> findByUser(User user);
    List<DispositifMedical> findByStatut(String statut);
    List<DispositifMedical> findByUserOrderByCreatedAtDesc(User user);
}
