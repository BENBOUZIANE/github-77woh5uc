package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.ComplementSuspecte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplementSuspecteRepository extends JpaRepository<ComplementSuspecte, Long> {
    @Query("SELECT c.nomSpecialite, COUNT(c) FROM ComplementSuspecte c GROUP BY c.nomSpecialite")
    List<Object[]> countByFormeGaleniqueGrouped();
}
