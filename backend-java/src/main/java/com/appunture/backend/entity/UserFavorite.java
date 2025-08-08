package com.appunture.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_favorites", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_favorite", columnNames = {"user_id", "point_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_favorite_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "point_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_favorite_point"))
    private Point point;
}
