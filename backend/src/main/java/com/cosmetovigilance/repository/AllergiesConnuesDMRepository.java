package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AllergiesConnuesDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AllergiesConnuesDMRepository extends JpaRepository<AllergiesConnuesDM, Long> {
    List<AllergiesConnuesDM> findByPersonneExposeeDmId(Long personneExposeeDmId);
}
