package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.EffetIndesirableCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EffetIndesirableCARepository extends JpaRepository<EffetIndesirableCA, Long> {
    @Query("SELECT e.evolutionEffet, COUNT(e) FROM EffetIndesirableCA e GROUP BY e.evolutionEffet")
    List<Object[]> countByEvolutionEffetGrouped();

    long countByGraviteTrue();
}
