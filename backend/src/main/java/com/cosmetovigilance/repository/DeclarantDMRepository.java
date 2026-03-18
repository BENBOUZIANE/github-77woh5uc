package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.DeclarantDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeclarantDMRepository extends JpaRepository<DeclarantDM, Long> {
}
