package com.appunture.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "point_symptoms", uniqueConstraints = {
        @UniqueConstraint(name = "uk_point_symptom", columnNames = {"point_id", "symptom_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointSymptom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "point_id", nullable = false, foreignKey = @ForeignKey(name = "fk_point_symptom_point"))
    private Point point;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "symptom_id", nullable = false, foreignKey = @ForeignKey(name = "fk_point_symptom_symptom"))
    private Symptom symptom;

    @Column(nullable = false)
    private Integer score; // effectiveness score
}
