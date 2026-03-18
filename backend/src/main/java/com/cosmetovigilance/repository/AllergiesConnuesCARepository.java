package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.AllergiesConnuesCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AllergiesConnuesCARepository extends JpaRepository<AllergiesConnuesCA, Long> {
}
