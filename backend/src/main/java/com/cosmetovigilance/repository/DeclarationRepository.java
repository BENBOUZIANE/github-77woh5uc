package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.Declaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, String> {
    List<Declaration> findByUserId(String userId);
    List<Declaration> findByDeclarantId(String declarantId);
}
