package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ProduitSuspecte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitSuspecteRepository extends JpaRepository<ProduitSuspecte, String> {
    List<ProduitSuspecte> findByDeclarationId(String declarationId);

    @Query("SELECT ps.typeProduit, ei.gravite, COUNT(ps.id) " +
           "FROM ProduitSuspecte ps " +
           "JOIN ps.declaration d " +
           "LEFT JOIN EffetIndesirable ei ON ei.declaration.id = d.id " +
           "GROUP BY ps.typeProduit, ei.gravite")
    List<Object[]> findStatsByTypeProduitAndGravite();
}
