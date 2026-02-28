package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.MedicamentProduitSimultanement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicamentProduitSimultanementRepository extends JpaRepository<MedicamentProduitSimultanement, String> {
    List<MedicamentProduitSimultanement> findByPersonneExposeeId(String personneExposeeId);
}
