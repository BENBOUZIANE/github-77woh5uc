package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PersonneExposeeCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonneExposeeCARepository extends JpaRepository<PersonneExposeeCA, Long> {
    @Query("SELECT p.sexe, COUNT(p) FROM PersonneExposeeCA p GROUP BY p.sexe")
    List<Object[]> countBySexeGrouped();

    @Query("SELECT p.ville, COUNT(p) FROM PersonneExposeeCA p GROUP BY p.ville ORDER BY COUNT(p) DESC")
    List<Object[]> countByVilleGrouped();
}
