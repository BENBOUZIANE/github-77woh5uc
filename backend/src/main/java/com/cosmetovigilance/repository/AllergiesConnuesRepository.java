package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AllergiesConnues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergiesConnuesRepository extends JpaRepository<AllergiesConnues, String> {
    List<AllergiesConnues> findByPersonneExposeeId(String personneExposeeId);
}
