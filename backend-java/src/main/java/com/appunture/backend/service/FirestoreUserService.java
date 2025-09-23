package com.appunture.backend.service;

import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.repository.firestore.FirestoreUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service para operações com usuários usando Firestore
 * Substitui o UserService com JPA
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FirestoreUserService {

    private final FirestoreUserRepository userRepository;

    /**
     * Busca um usuário por email
     */
    public Optional<FirestoreUser> findByEmail(String email) {
        log.debug("Buscando usuário por email: {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Busca um usuário por Firebase UID
     */
    public Optional<FirestoreUser> findByFirebaseUid(String firebaseUid) {
        log.debug("Buscando usuário por Firebase UID: {}", firebaseUid);
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    /**
     * Busca um usuário por ID do documento Firestore
     */
    public Optional<FirestoreUser> findById(String id) {
        log.debug("Buscando usuário por ID: {}", id);
        return userRepository.findById(id);
    }

    /**
     * Verifica se um email já está cadastrado
     */
    public boolean existsByEmail(String email) {
        log.debug("Verificando se email existe: {}", email);
        return userRepository.existsByEmail(email);
    }

    /**
     * Verifica se um Firebase UID já está cadastrado
     */
    public boolean existsByFirebaseUid(String firebaseUid) {
        log.debug("Verificando se Firebase UID existe: {}", firebaseUid);
        return userRepository.existsByFirebaseUid(firebaseUid);
    }

    /**
     * Lista todos os usuários (para admin)
     */
    public List<FirestoreUser> findAll() {
        log.debug("Listando todos os usuários");
        return userRepository.findAll();
    }

    /**
     * Lista usuários por role
     */
    public List<FirestoreUser> findByRole(String role) {
        log.debug("Listando usuários por role: {}", role);
        return userRepository.findByRole(role);
    }

    /**
     * Cria um novo usuário
     */
    public FirestoreUser createUser(String firebaseUid, String email, String name, String role) {
        log.debug("Criando novo usuário: email={}, role={}", email, role);
        
        if (existsByEmail(email)) {
            throw new IllegalArgumentException("Email já está em uso: " + email);
        }
        
        if (existsByFirebaseUid(firebaseUid)) {
            throw new IllegalArgumentException("Firebase UID já está em uso: " + firebaseUid);
        }

        FirestoreUser user = FirestoreUser.builder()
                .firebaseUid(firebaseUid)
                .email(email)
                .name(name)
                .role(role != null ? role : "USER")
                .enabled(true)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    /**
     * Atualiza um usuário existente
     */
    public FirestoreUser updateUser(String id, FirestoreUser updates) {
        log.debug("Atualizando usuário: {}", id);
        
        Optional<FirestoreUser> existing = userRepository.findById(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + id);
        }

        FirestoreUser user = existing.get();
        
        // Atualizar apenas campos não nulos
        if (updates.getName() != null) {
            user.setName(updates.getName());
        }
        if (updates.getEmail() != null && !updates.getEmail().equals(user.getEmail())) {
            if (existsByEmail(updates.getEmail())) {
                throw new IllegalArgumentException("Email já está em uso: " + updates.getEmail());
            }
            user.setEmail(updates.getEmail());
        }
        if (updates.getRole() != null) {
            user.setRole(updates.getRole());
        }
        if (updates.getProfileImageUrl() != null) {
            user.setProfileImageUrl(updates.getProfileImageUrl());
        }
        if (updates.getPhoneNumber() != null) {
            user.setPhoneNumber(updates.getPhoneNumber());
        }
        
        user.setEmailVerified(updates.isEmailVerified());
        user.setEnabled(updates.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Deleta um usuário
     */
    public void deleteUser(String id) {
        log.debug("Deletando usuário: {}", id);
        
        Optional<FirestoreUser> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + id);
        }

        userRepository.deleteById(id);
        log.info("Usuário deletado com sucesso: {}", id);
    }

    /**
     * Adiciona ponto aos favoritos do usuário
     */
    public void addFavoritePoint(String userId, String pointId) {
        log.debug("Adicionando ponto {} aos favoritos do usuário {}", pointId, userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        if (user.getFavoritePointIds() == null) {
            user.setFavoritePointIds(new java.util.ArrayList<>(List.of(pointId)));
        } else if (!user.getFavoritePointIds().contains(pointId)) {
            user.getFavoritePointIds().add(pointId);
        }

        userRepository.save(user);
        log.debug("Ponto adicionado aos favoritos com sucesso");
    }

    /**
     * Remove ponto dos favoritos do usuário
     */
    public void removeFavoritePoint(String userId, String pointId) {
        log.debug("Removendo ponto {} dos favoritos do usuário {}", pointId, userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        if (user.getFavoritePointIds() != null) {
            user.getFavoritePointIds().remove(pointId);
            userRepository.save(user);
            log.debug("Ponto removido dos favoritos com sucesso");
        }
    }

    /**
     * Verifica se um ponto está nos favoritos do usuário
     */
    public boolean isPointFavorited(String userId, String pointId) {
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        FirestoreUser user = userOpt.get();
        return user.getFavoritePointIds() != null && user.getFavoritePointIds().contains(pointId);
    }

    /**
     * Obtém lista de pontos favoritos do usuário
     */
    public List<String> getFavoritePointIds(String userId) {
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        FirestoreUser user = userOpt.get();
        return user.getFavoritePointIds() != null ? user.getFavoritePointIds() : List.of();
    }

    /**
     * Converte FirestoreUser para UserProfileResponse
     */
    public UserProfileResponse toProfileResponse(FirestoreUser user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .profileImageUrl(user.getProfileImageUrl())
                .phoneNumber(user.getPhoneNumber())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .favoritePointIds(user.getFavoritePointIds())
                .build();
    }

    /**
     * Conta total de usuários
     */
    public long count() {
        return userRepository.count();
    }

    /**
     * Atualiza role do usuário
     */
    public FirestoreUser updateUserRole(String userId, String newRole) {
        log.debug("Atualizando role do usuário {} para {}", userId, newRole);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Ativa/desativa usuário
     */
    public FirestoreUser toggleUserEnabled(String userId) {
        log.debug("Alternando status do usuário: {}", userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        user.setEnabled(!user.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}