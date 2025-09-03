package com.appunture.backend.service;

import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.dto.mapper.PointMapper;
import com.appunture.backend.entity.Point;
import com.appunture.backend.entity.User;
import com.appunture.backend.entity.UserFavorite;
import com.appunture.backend.repository.PointRepository;
import com.appunture.backend.repository.UserFavoriteRepository;
import com.appunture.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final UserRepository userRepository;
    private final PointRepository pointRepository;
    private final PointMapper pointMapper;

    /**
     * Adiciona um ponto aos favoritos do usuário
     */
    @Transactional
    public void addToFavorites(Long userId, Long pointId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Point point = pointRepository.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Point not found"));

        // Verifica se já está nos favoritos
        Optional<UserFavorite> existing = userFavoriteRepository.findByUserIdAndPointId(userId, pointId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Point is already in favorites");
        }

        UserFavorite favorite = UserFavorite.builder()
                .user(user)
                .point(point)
                .build();

        userFavoriteRepository.save(favorite);
    }

    /**
     * Remove um ponto dos favoritos do usuário
     */
    @Transactional
    public void removeFromFavorites(Long userId, Long pointId) {
        UserFavorite favorite = userFavoriteRepository.findByUserIdAndPointId(userId, pointId)
                .orElseThrow(() -> new IllegalArgumentException("Favorite not found"));

        userFavoriteRepository.delete(favorite);
    }

    /**
     * Lista todos os pontos favoritos de um usuário
     */
    @Transactional(readOnly = true)
    public List<PointResponse> getUserFavorites(Long userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findByUserId(userId);
        
        return favorites.stream()
                .map(favorite -> pointMapper.toResponse(favorite.getPoint()))
                .toList();
    }

    /**
     * Verifica se um ponto está nos favoritos do usuário
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long pointId) {
        return userFavoriteRepository.findByUserIdAndPointId(userId, pointId).isPresent();
    }

    /**
     * Remove todos os favoritos de um usuário
     */
    @Transactional
    public void clearUserFavorites(Long userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findByUserId(userId);
        userFavoriteRepository.deleteAll(favorites);
    }

    /**
     * Conta quantos favoritos um usuário tem
     */
    @Transactional(readOnly = true)
    public long countUserFavorites(Long userId) {
        return userFavoriteRepository.findByUserId(userId).size();
    }
}
