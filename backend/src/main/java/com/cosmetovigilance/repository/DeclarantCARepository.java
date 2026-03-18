package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.DeclarantCA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeclarantCARepository extends JpaRepository<DeclarantCA, Long> {
}
