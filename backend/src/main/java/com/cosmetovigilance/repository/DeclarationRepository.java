package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.Declaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, String> {
    List<Declaration> findByUserId(String userId);
    List<Declaration> findByDeclarantId(String declarantId);

    @Query("SELECT pe.age, pe.ageUnite, ei.gravite, COUNT(d.id) " +
           "FROM Declaration d " +
           "JOIN d.personneExposee pe " +
           "LEFT JOIN EffetIndesirable ei ON ei.declaration.id = d.id " +
           "GROUP BY pe.age, pe.ageUnite, ei.gravite")
    List<Object[]> findStatsByAgeAndGravite();

    @Query("SELECT pe.sexe, ei.gravite, COUNT(d.id) " +
           "FROM Declaration d " +
           "JOIN d.personneExposee pe " +
           "LEFT JOIN EffetIndesirable ei ON ei.declaration.id = d.id " +
           "GROUP BY pe.sexe, ei.gravite")
    List<Object[]> findStatsBySexeAndGravite();

    @Query("SELECT pe.type, ei.gravite, COUNT(d.id) " +
           "FROM Declaration d " +
           "JOIN d.personneExposee pe " +
           "LEFT JOIN EffetIndesirable ei ON ei.declaration.id = d.id " +
           "GROUP BY pe.type, ei.gravite")
    List<Object[]> findStatsByNotifiantAndGravite();

    @Query("SELECT d.statut, COUNT(d.id) " +
           "FROM Declaration d " +
           "GROUP BY d.statut")
    List<Object[]> findStatsByStatut();
}
