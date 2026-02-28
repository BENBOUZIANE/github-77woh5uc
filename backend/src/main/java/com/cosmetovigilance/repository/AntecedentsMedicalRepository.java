package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AntecedentsMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntecedentsMedicalRepository extends JpaRepository<AntecedentsMedical, String> {
    List<AntecedentsMedical> findByPersonneExposeeId(String personneExposeeId);
}
