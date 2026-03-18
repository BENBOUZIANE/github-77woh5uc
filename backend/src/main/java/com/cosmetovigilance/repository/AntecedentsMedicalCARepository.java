package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AntecedentsMedicalCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AntecedentsMedicalCARepository extends JpaRepository<AntecedentsMedicalCA, Long> {
}
