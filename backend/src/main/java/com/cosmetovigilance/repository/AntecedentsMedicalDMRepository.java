package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AntecedentsMedicalDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AntecedentsMedicalDMRepository extends JpaRepository<AntecedentsMedicalDM, Long> {
    List<AntecedentsMedicalDM> findByPersonneExposeeDmId(Long personneExposeeDmId);
}
