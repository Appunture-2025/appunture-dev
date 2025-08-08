package com.appunture.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "points")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Point {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "chinese_name", length = 150)
    private String chineseName;

    @Column(nullable = false, length = 100)
    private String meridian;

    @Lob
    @Column(nullable = false)
    private String location;

    @Lob
    private String indications;

    @Lob
    private String contraindications;

    @Column(columnDefinition = "TEXT")
    private String coordinatesJson; // store JSON as text (later can use JSONB)

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
