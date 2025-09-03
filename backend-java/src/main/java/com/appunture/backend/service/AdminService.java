package com.appunture.backend.service;

import com.appunture.backend.dto.stats.AdminStatsResponse;
import com.appunture.backend.entity.User;
import com.appunture.backend.repository.PointRepository;
import com.appunture.backend.repository.SymptomRepository;
import com.appunture.backend.repository.UserRepository;
import com.appunture.backend.repository.UserFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PointRepository pointRepository;
    private final SymptomRepository symptomRepository;
    private final UserFavoriteRepository userFavoriteRepository;

    /**
     * Obtém estatísticas gerais do sistema
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getSystemStats() {
        long totalUsers = userRepository.count();
        long totalPoints = pointRepository.count();
        long totalSymptoms = symptomRepository.count();
        long totalFavorites = userFavoriteRepository.count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalPoints(totalPoints)
                .totalSymptoms(totalSymptoms)
                .totalFavorites(totalFavorites)
                .build();
    }

    /**
     * Lista todos os usuários com paginação
     */
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Lista usuários por role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    /**
     * Promove um usuário para admin
     */
    @Transactional
    public User promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole("ROLE_ADMIN");
        return userRepository.save(user);
    }

    /**
     * Remove privilégios de admin de um usuário
     */
    @Transactional
    public User demoteFromAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    /**
     * Deleta um usuário (apenas admin)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Não permite deletar admin se for o último
        if ("ROLE_ADMIN".equals(user.getRole())) {
            long adminCount = userRepository.countByRole("ROLE_ADMIN");
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot delete the last admin user");
            }
        }
        
        userRepository.delete(user);
    }

    /**
     * Busca usuários por email (busca parcial)
     */
    @Transactional(readOnly = true)
    public List<User> searchUsersByEmail(String email) {
        return userRepository.findByEmailContainingIgnoreCase(email);
    }

    /**
     * Verifica se o usuário é admin
     */
    public boolean isAdmin(User user) {
        return "ROLE_ADMIN".equals(user.getRole());
    }

    /**
     * Conta usuários por role
     */
    @Transactional(readOnly = true)
    public long countUsersByRole(String role) {
        return userRepository.countByRole(role);
    }
}
