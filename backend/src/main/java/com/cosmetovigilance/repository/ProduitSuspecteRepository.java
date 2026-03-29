package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProduitSuspecte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitSuspecteRepository extends JpaRepository<ProduitSuspecte, String> {
    List<ProduitSuspecte> findByDeclarationId(String declarationId);

    @Query(value = "SELECT ps.type_produit, ei.gravite, COUNT(ps.id) " +
           "FROM produit_suspecte ps " +
           "LEFT JOIN effet_indesirable ei ON ei.declaration_id = ps.declaration_id " +
           "GROUP BY ps.type_produit, ei.gravite", nativeQuery = true)
    List<Object[]> findStatsByTypeProduitAndGravite();
}
