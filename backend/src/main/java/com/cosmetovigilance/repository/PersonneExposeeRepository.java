package com.cosmetovigilance.repository;

import com.cosmetovigilance.model.PersonneExposee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonneExposeeRepository extends JpaRepository<PersonneExposee, String> {
}
