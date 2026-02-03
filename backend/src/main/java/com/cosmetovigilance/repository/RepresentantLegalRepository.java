package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.RepresentantLegal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepresentantLegalRepository extends JpaRepository<RepresentantLegal, String> {
    Optional<RepresentantLegal> findByProfessionnelSanteId(String professionnelSanteId);
}
