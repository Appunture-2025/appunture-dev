package com.appunture.backend.repository;

import com.appunture.backend.entity.PointSymptom;
import com.appunture.backend.entity.Point;
import com.appunture.backend.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PointSymptomRepository extends JpaRepository<PointSymptom, Long> {
    Optional<PointSymptom> findByPointIdAndSymptomId(Long pointId, Long symptomId);
    List<PointSymptom> findByPoint(Point point);
    List<PointSymptom> findBySymptom(Symptom symptom);
    List<PointSymptom> findByPointId(Long pointId);
    List<PointSymptom> findBySymptomId(Long symptomId);
    boolean existsByPointIdAndSymptomId(Long pointId, Long symptomId);
}
