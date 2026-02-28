package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {
    List<Attachment> findByDeclarationId(String declarationId);
    List<Attachment> findByUserId(String userId);
}
