package com.appunture.backend.controller;

import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.service.FirestoreUserService;
import com.google.firebase.auth.FirebaseToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controller para autenticação usando Firebase Auth + Firestore
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Authentication and user profile endpoints (Firebase + Firestore)")
@RequiredArgsConstructor
@Slf4j
public class FirestoreAuthController {

    private final FirestoreUserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Returns current authenticated user profile from Firestore")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal FirebaseToken token) {
        try {
            log.debug("Obtendo perfil do usuário: {}", token.getUid());
            
            Optional<FirestoreUser> userOpt = userService.findByFirebaseUid(token.getUid());
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            UserProfileResponse profile = userService.toProfileResponse(userOpt.get());
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("Erro ao obter perfil do usuário: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates current user profile in Firestore")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal FirebaseToken token,
            @RequestBody Map<String, Object> updates) {
        try {
            log.debug("Atualizando perfil do usuário: {}", token.getUid());
            
            Optional<FirestoreUser> userOpt = userService.findByFirebaseUid(token.getUid());
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FirestoreUser user = userOpt.get();
            
            // Atualizar campos permitidos
            FirestoreUser updateData = FirestoreUser.builder().build();
            
            if (updates.containsKey("name")) {
                updateData.setName((String) updates.get("name"));
            }
            if (updates.containsKey("phoneNumber")) {
                updateData.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            if (updates.containsKey("profileImageUrl")) {
                updateData.setProfileImageUrl((String) updates.get("profileImageUrl"));
            }

            FirestoreUser updatedUser = userService.updateUser(user.getId(), updateData);
            UserProfileResponse profile = userService.toProfileResponse(updatedUser);
            
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("Erro ao atualizar perfil do usuário: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sync")
    @Operation(summary = "Sync Firebase user", description = "Creates or updates user in Firestore from Firebase Auth")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<UserProfileResponse> syncUser(@AuthenticationPrincipal FirebaseToken token) {
        try {
            log.debug("Sincronizando usuário: {}", token.getUid());
            
            // Verificar se usuário já existe no Firestore
            Optional<FirestoreUser> existingUser = userService.findByFirebaseUid(token.getUid());
            
            if (existingUser.isPresent()) {
                // Usuário já existe, retornar perfil
                UserProfileResponse profile = userService.toProfileResponse(existingUser.get());
                return ResponseEntity.ok(profile);
            }

            // Criar novo usuário no Firestore
            String email = token.getEmail();
            String name = token.getName() != null ? token.getName() : email.split("@")[0];
            
            FirestoreUser newUser = userService.createUser(
                token.getUid(),
                email,
                name,
                "USER" // Role padrão
            );

            UserProfileResponse profile = userService.toProfileResponse(newUser);
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("Erro ao sincronizar usuário: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info", description = "Returns Firebase token info and Firestore profile")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal FirebaseToken token) {
        try {
            log.debug("Obtendo informações do usuário atual: {}", token.getUid());
            
            // Informações do Firebase Token
            Map<String, Object> firebaseInfo = Map.of(
                "uid", token.getUid(),
                "email", token.getEmail() != null ? token.getEmail() : "",
                "name", token.getName() != null ? token.getName() : "",
                "emailVerified", token.isEmailVerified(),
                "issuer", token.getIssuer()
            );

            // Buscar perfil no Firestore
            Optional<FirestoreUser> userOpt = userService.findByFirebaseUid(token.getUid());
            
            Map<String, Object> response = Map.of(
                "firebase", firebaseInfo,
                "profile", userOpt.map(userService::toProfileResponse).orElse(null)
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter informações do usuário atual: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/favorites/{pointId}")
    @Operation(summary = "Add favorite point", description = "Adds a point to user's favorites")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Void> addFavorite(
            @AuthenticationPrincipal FirebaseToken token,
            @PathVariable String pointId) {
        try {
            log.debug("Adicionando ponto {} aos favoritos do usuário {}", pointId, token.getUid());
            
            Optional<FirestoreUser> userOpt = userService.findByFirebaseUid(token.getUid());
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            userService.addFavoritePoint(userOpt.get().getId(), pointId);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Erro ao adicionar favorito: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/favorites/{pointId}")
    @Operation(summary = "Remove favorite point", description = "Removes a point from user's favorites")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal FirebaseToken token,
            @PathVariable String pointId) {
        try {
            log.debug("Removendo ponto {} dos favoritos do usuário {}", pointId, token.getUid());
            
            Optional<FirestoreUser> userOpt = userService.findByFirebaseUid(token.getUid());
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            userService.removeFavoritePoint(userOpt.get().getId(), pointId);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Erro ao remover favorito: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}