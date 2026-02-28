package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProfessionnelSante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfessionnelSanteRepository extends JpaRepository<ProfessionnelSante, String> {
    Optional<ProfessionnelSante> findByUtilisateurId(String utilisateurId);
}
