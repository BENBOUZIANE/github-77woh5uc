package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProfessionnelSanteDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionnelSanteDMRepository extends JpaRepository<ProfessionnelSanteDM, Long> {
}
