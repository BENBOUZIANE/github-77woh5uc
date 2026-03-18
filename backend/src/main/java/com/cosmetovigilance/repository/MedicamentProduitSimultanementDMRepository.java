package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.MedicamentProduitSimultanementDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentProduitSimultanementDMRepository extends JpaRepository<MedicamentProduitSimultanementDM, Long> {
    List<MedicamentProduitSimultanementDM> findByPersonneExposeeDmId(Long personneExposeeDmId);
}
