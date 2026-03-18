package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.RepresentantLegalDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepresentantLegalDMRepository extends JpaRepository<RepresentantLegalDM, Long> {
}
