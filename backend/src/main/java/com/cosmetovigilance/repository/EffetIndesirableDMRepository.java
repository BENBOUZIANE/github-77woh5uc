package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.EffetIndesirableDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EffetIndesirableDMRepository extends JpaRepository<EffetIndesirableDM, Long> {
    List<EffetIndesirableDM> findByDispositifMedicalId(Long dispositifMedicalId);
}
