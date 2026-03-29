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

    @Query(value = "SELECT pe.age, pe.age_unite, ei.gravite, COUNT(d.id), pe.date_naissance " +
           "FROM declaration d " +
           "LEFT JOIN personne_exposee pe ON pe.id = d.personne_exposee_id " +
           "LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id " +
           "GROUP BY pe.age, pe.age_unite, ei.gravite, pe.date_naissance", nativeQuery = true)
    List<Object[]> findStatsByAgeAndGravite();

    @Query(value = "SELECT pe.sexe, ei.gravite, COUNT(d.id) " +
           "FROM declaration d " +
           "LEFT JOIN personne_exposee pe ON pe.id = d.personne_exposee_id " +
           "LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id " +
           "GROUP BY pe.sexe, ei.gravite", nativeQuery = true)
    List<Object[]> findStatsBySexeAndGravite();

    @Query(value = "SELECT pe.type, ei.gravite, COUNT(d.id) " +
           "FROM declaration d " +
           "LEFT JOIN personne_exposee pe ON pe.id = d.personne_exposee_id " +
           "LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id " +
           "GROUP BY pe.type, ei.gravite", nativeQuery = true)
    List<Object[]> findStatsByNotifiantAndGravite();

    @Query("SELECT d.statut, COUNT(d.id) FROM Declaration d GROUP BY d.statut")
    List<Object[]> findStatsByStatut();
}
