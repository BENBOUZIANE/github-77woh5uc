package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {
}
