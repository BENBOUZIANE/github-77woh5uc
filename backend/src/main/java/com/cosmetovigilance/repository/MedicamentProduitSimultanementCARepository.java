package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.MedicamentProduitSimultanementCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicamentProduitSimultanementCARepository extends JpaRepository<MedicamentProduitSimultanementCA, Long> {
}
