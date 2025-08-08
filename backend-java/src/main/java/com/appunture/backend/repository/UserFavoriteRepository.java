package com.appunture.backend.repository;

import com.appunture.backend.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    Optional<UserFavorite> findByUserIdAndPointId(Long userId, Long pointId);
    List<UserFavorite> findByUserId(Long userId);
}
