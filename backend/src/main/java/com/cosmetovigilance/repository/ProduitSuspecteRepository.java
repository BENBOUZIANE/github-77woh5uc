package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProduitSuspecte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitSuspecteRepository extends JpaRepository<ProduitSuspecte, String> {
    List<ProduitSuspecte> findByDeclarationId(String declarationId);
}
