package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.EffetIndesirable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EffetIndesirableRepository extends JpaRepository<EffetIndesirable, String> {
    List<EffetIndesirable> findByDeclarationId(String declarationId);

    @Query("SELECT e.criteresGravite, COUNT(e.id) " +
           "FROM EffetIndesirable e " +
           "WHERE e.gravite = true " +
           "GROUP BY e.criteresGravite")
    List<Object[]> findStatsByCriteresGravite();
}
