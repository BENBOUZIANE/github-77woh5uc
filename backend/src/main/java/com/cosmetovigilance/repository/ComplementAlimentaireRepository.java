package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ComplementAlimentaire;
import com.cosmetovigilance.model.DeclarationStatus;
import com.cosmetovigilance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplementAlimentaireRepository extends JpaRepository<ComplementAlimentaire, Long> {
    List<ComplementAlimentaire> findByUser(User user);

    List<ComplementAlimentaire> findByUserOrderByDateCreationDesc(User user);

    @Query("SELECT COUNT(c) FROM ComplementAlimentaire c WHERE c.dateCreation >= :startDate")
    long countByDateCreationAfter(LocalDateTime startDate);

    long countByStatut(DeclarationStatus statut);

    @Query("SELECT c.statut, COUNT(c) FROM ComplementAlimentaire c GROUP BY c.statut")
    List<Object[]> countByStatutGrouped();
}
