package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.Declarant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeclarantRepository extends JpaRepository<Declarant, String> {
    Optional<Declarant> findByUtilisateurId(String utilisateurId);
}
