package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.RepresentantLegalCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepresentantLegalCARepository extends JpaRepository<RepresentantLegalCA, Long> {
}
