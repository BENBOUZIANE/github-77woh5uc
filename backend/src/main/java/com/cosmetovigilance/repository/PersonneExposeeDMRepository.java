package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PersonneExposeeDM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonneExposeeDMRepository extends JpaRepository<PersonneExposeeDM, Long> {
}
