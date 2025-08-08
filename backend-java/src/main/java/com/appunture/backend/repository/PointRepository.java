package com.appunture.backend.repository;

import com.appunture.backend.entity.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PointRepository extends JpaRepository<Point, Long> {
    Optional<Point> findByCode(String code);
    List<Point> findByMeridianOrderByCodeAsc(String meridian);

    @Query("SELECT p FROM Point p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.chineseName) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.code) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.meridian) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.location) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.indications) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Point> search(String term);
}
