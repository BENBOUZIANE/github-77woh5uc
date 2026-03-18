package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProfessionnelSanteCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionnelSanteCARepository extends JpaRepository<ProfessionnelSanteCA, Long> {
}
