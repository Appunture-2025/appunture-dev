package com.appunture.backend.repository;

import com.appunture.backend.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SymptomRepository extends JpaRepository<Symptom, Long> {
    Optional<Symptom> findByNameIgnoreCase(String name);
}
