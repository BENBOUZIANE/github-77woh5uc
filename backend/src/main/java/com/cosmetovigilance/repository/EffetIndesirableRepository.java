package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.EffetIndesirable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EffetIndesirableRepository extends JpaRepository<EffetIndesirable, String> {
    List<EffetIndesirable> findByDeclarationId(String declarationId);
}
