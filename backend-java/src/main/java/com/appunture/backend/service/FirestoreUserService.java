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

@Service
@RequiredArgsConstructor
@Slf4j
public class FirestoreUserService {

    private final FirestoreUserRepository userRepository;

    public Optional<FirestoreUser> findByEmail(String email) {
        log.debug("Buscando usuário por email: {}", email);
        return userRepository.findByEmail(email);
    }

    public Optional<FirestoreUser> findByFirebaseUid(String firebaseUid) {
        log.debug("Buscando usuário por Firebase UID: {}", firebaseUid);
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public Optional<FirestoreUser> findById(String id) {
        log.debug("Buscando usuário por ID: {}", id);
        return userRepository.findById(id);
    }

    public boolean existsByEmail(String email) {
        log.debug("Verificando se email existe: {}", email);
        return userRepository.existsByEmail(email);
    }

    public boolean existsByFirebaseUid(String firebaseUid) {
        log.debug("Verificando se Firebase UID existe: {}", firebaseUid);
        return userRepository.existsByFirebaseUid(firebaseUid);
    }

    public List<FirestoreUser> findAll() {
        log.debug("Listando todos os usuários");
        return userRepository.findAll();
    }

    public List<FirestoreUser> findByRole(String role) {
        log.debug("Listando usuários por role: {}", role);
        return userRepository.findByRole(role);
    }

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

    public void deleteUser(String id) {
        log.debug("Deletando usuário: {}", id);
        
        Optional<FirestoreUser> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + id);
        }

        userRepository.deleteById(id);
        log.info("Usuário deletado com sucesso: {}", id);
    }

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

    public boolean isPointFavorited(String userId, String pointId) {
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        FirestoreUser user = userOpt.get();
        return user.getFavoritePointIds() != null && user.getFavoritePointIds().contains(pointId);
    }

    public List<String> getFavoritePointIds(String userId) {
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        FirestoreUser user = userOpt.get();
        return user.getFavoritePointIds() != null ? user.getFavoritePointIds() : List.of();
    }

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

    public long count() {
        return userRepository.count();
    }

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

    public void updateFcmToken(String userId, String fcmToken) {
        log.debug("Atualizando FCM token do usuário: {}", userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        user.setFcmToken(fcmToken);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("FCM token atualizado para usuário: {}", userId);
    }

    public void removeFcmToken(String userId) {
        log.debug("Removendo FCM token do usuário: {}", userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        user.setFcmToken(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("FCM token removido do usuário: {}", userId);
    }

    public String getFcmToken(String userId) {
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        return userOpt.map(FirestoreUser::getFcmToken).orElse(null);
    }

    public String getFcmTokenByFirebaseUid(String firebaseUid) {
        Optional<FirestoreUser> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        return userOpt.map(FirestoreUser::getFcmToken).orElse(null);
    }

    public void addNotificationTopic(String userId, String topic) {
        log.debug("Adicionando tópico {} ao usuário {}", topic, userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        if (user.getNotificationTopics() == null) {
            user.setNotificationTopics(new java.util.ArrayList<>(List.of(topic)));
        } else if (!user.getNotificationTopics().contains(topic)) {
            user.getNotificationTopics().add(topic);
        }
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    public void removeNotificationTopic(String userId, String topic) {
        log.debug("Removendo tópico {} do usuário {}", topic, userId);
        
        Optional<FirestoreUser> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado: " + userId);
        }

        FirestoreUser user = userOpt.get();
        if (user.getNotificationTopics() != null) {
            user.getNotificationTopics().remove(topic);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
}