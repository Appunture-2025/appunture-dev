package com.appunture.backend.service;

import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.entity.User;
import com.appunture.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Busca um usuário por email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Busca um usuário por ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Verifica se um email já está cadastrado
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Lista todos os usuários (para admin)
     */
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * Lista usuários com paginação (para admin)
     */
    @Transactional(readOnly = true)
    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Cria um novo usuário
     */
    @Transactional
    public User createUser(String email, String password, String name, String profession, String role) {
        if (existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .profession(profession)
                .role(role != null ? role : "ROLE_USER")
                .build();

        return userRepository.save(user);
    }

    /**
     * Atualiza o perfil do usuário
     */
    @Transactional
    public User updateProfile(Long userId, String name, String profession) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setName(name);
        user.setProfession(profession);
        
        return userRepository.save(user);
    }

    /**
     * Atualiza a senha do usuário
     */
    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Atualiza o role do usuário (apenas para admin)
     */
    @Transactional
    public User updateRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * Deleta um usuário
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        userRepository.delete(user);
    }

    /**
     * Converte User para UserProfileResponse
     */
    public UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .profession(user.getProfession())
                .role(user.getRole())
                .build();
    }

    /**
     * Valida se o usuário tem permissão de admin
     */
    public boolean isAdmin(User user) {
        return "ROLE_ADMIN".equals(user.getRole());
    }

    /**
     * Busca um usuário por Firebase UID
     */
    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    /**
     * Verifica se um Firebase UID já está cadastrado
     */
    public boolean existsByFirebaseUid(String firebaseUid) {
        return userRepository.existsByFirebaseUid(firebaseUid);
    }

    /**
     * Salva um usuário
     */
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Conta total de usuários
     */
    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }
}
