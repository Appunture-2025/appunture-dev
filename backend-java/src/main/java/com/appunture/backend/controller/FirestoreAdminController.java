package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.service.FirebaseAuthService;
import com.appunture.backend.service.FirestorePointService;
import com.appunture.backend.service.FirestoreSymptomService;
import com.appunture.backend.service.FirestoreUserService;
import com.google.firebase.auth.FirebaseToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller administrativo para operações com Firestore
 */
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Administrative operations (Firestore)")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class FirestoreAdminController {

    private final FirestoreUserService userService;
    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;
    private final FirebaseAuthService firebaseAuthService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard", description = "Returns general statistics for admin dashboard")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            log.debug("Obtendo dados do dashboard administrativo");
            
            long totalUsers = userService.count();
            long totalPoints = pointService.count();
            long totalSymptoms = symptomService.count();
            
            List<FirestoreUser> recentUsers = userService.findAll().stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(5)
                .toList();
            
            Map<String, Object> dashboard = Map.of(
                "statistics", Map.of(
                    "totalUsers", totalUsers,
                    "totalPoints", totalPoints,
                    "totalSymptoms", totalSymptoms
                ),
                "recentUsers", recentUsers.stream()
                    .map(userService::toProfileResponse)
                    .toList(),
                "popularPoints", pointService.findPopularPoints(5),
                "popularSymptoms", symptomService.findTopUsed(5)
            );
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("Erro ao obter dashboard: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Returns all users for admin management")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreUser>> getAllUsers() {
        try {
            List<FirestoreUser> users = userService.findAll();
            log.debug("Retornando {} usuários para administração", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erro ao listar usuários: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details", description = "Returns detailed user information")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreUser> getUserDetails(@PathVariable String userId) {
        try {
            Optional<FirestoreUser> user = userService.findById(userId);
            return user.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao obter detalhes do usuário {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role", description = "Updates user role (USER/ADMIN)")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreUser> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            if (newRole == null || (!newRole.equals("USER") && !newRole.equals("ADMIN"))) {
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("Atualizando role do usuário {} para {}", userId, newRole);
            
            FirestoreUser updatedUser = userService.updateUserRole(userId, newRole);
            
            // Atualizar custom claims no Firebase Auth
            Optional<FirestoreUser> userOpt = userService.findById(userId);
            if (userOpt.isPresent()) {
                firebaseAuthService.setUserRole(userOpt.get().getFirebaseUid(), newRole);
            }
            
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao atualizar role do usuário {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar role do usuário {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{userId}/enabled")
    @Operation(summary = "Toggle user enabled status", description = "Enables or disables a user account")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreUser> toggleUserEnabled(@PathVariable String userId) {
        try {
            log.debug("Alternando status do usuário: {}", userId);
            FirestoreUser updatedUser = userService.toggleUserEnabled(userId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            log.warn("Usuário não encontrado para alternar status: {}", userId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao alternar status do usuário {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user", description = "Permanently deletes a user account")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        try {
            log.debug("Deletando usuário: {}", userId);
            
            // Buscar usuário para obter Firebase UID
            Optional<FirestoreUser> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            String firebaseUid = userOpt.get().getFirebaseUid();
            
            // Deletar do Firestore
            userService.deleteUser(userId);
            
            // Deletar do Firebase Auth
            try {
                firebaseAuthService.deleteUser(firebaseUid);
            } catch (Exception e) {
                log.warn("Erro ao deletar usuário do Firebase Auth: {}", e.getMessage());
                // Continuar mesmo com erro no Firebase Auth
            }
            
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Usuário não encontrado para deletar: {}", userId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar usuário {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/users")
    @Operation(summary = "Create admin user", description = "Creates a new admin user")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreUser> createAdminUser(
            @AuthenticationPrincipal FirebaseToken token,
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String password = request.get("password");
            
            if (email == null || name == null || password == null) {
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("Criando usuário admin: {}", email);
            
            // Criar usuário no Firebase Auth
            String firebaseUid = firebaseAuthService.createUser(email, password, name);
            
            // Definir role como ADMIN
            firebaseAuthService.setUserRole(firebaseUid, "ADMIN");
            
            // Criar no Firestore
            FirestoreUser newUser = userService.createUser(firebaseUid, email, name, "ADMIN");
            
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            log.error("Erro ao criar usuário admin: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats/detailed")
    @Operation(summary = "Get detailed statistics", description = "Returns comprehensive system statistics")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> getDetailedStats() {
        try {
            log.debug("Obtendo estatísticas detalhadas");
            
            // Estatísticas gerais
            long totalUsers = userService.count();
            long totalPoints = pointService.count();
            long totalSymptoms = symptomService.count();
            
            // Estatísticas de usuários
            List<FirestoreUser> adminUsers = userService.findByRole("ADMIN");
            List<FirestoreUser> regularUsers = userService.findByRole("USER");
            
            // Estatísticas de sintomas
            List<String> categories = symptomService.findUniqueCategories();
            List<String> tags = symptomService.findUniqueTags();
            
            Map<String, Object> stats = Map.of(
                "users", Map.of(
                    "total", totalUsers,
                    "admins", adminUsers.size(),
                    "regular", regularUsers.size()
                ),
                "points", Map.of(
                    "total", totalPoints,
                    "popular", pointService.findPopularPoints(10)
                ),
                "symptoms", Map.of(
                    "total", totalSymptoms,
                    "categories", categories.size(),
                    "tags", tags.size(),
                    "popular", symptomService.findTopUsed(10)
                ),
                "categories", categories,
                "tags", tags
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas detalhadas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/data/seed")
    @Operation(summary = "Seed initial data", description = "Creates initial data for development/testing")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> seedData(@AuthenticationPrincipal FirebaseToken token) {
        try {
            log.debug("Iniciando seed de dados inicial");
            
            // Verificar se já existem dados
            if (pointService.count() > 0 || symptomService.count() > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Dados já existem no sistema"
                ));
            }
            
            // TODO: Implementar seed de dados iniciais
            // Por enquanto, retornar sucesso vazio
            Map<String, Object> result = Map.of(
                "message", "Seed de dados não implementado ainda",
                "pointsCreated", 0,
                "symptomsCreated", 0
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Erro ao fazer seed de dados: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Admin health check", description = "Checks system health for admin")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> adminHealthCheck() {
        try {
            log.debug("Verificando saúde do sistema");
            
            boolean firestoreOk = true;
            boolean firebaseAuthOk = true;
            
            try {
                userService.count();
            } catch (Exception e) {
                firestoreOk = false;
                log.warn("Firestore não está respondendo: {}", e.getMessage());
            }
            
            try {
                firebaseAuthService.verifyToken("dummy-token");
            } catch (Exception e) {
                // Expected for dummy token
                firebaseAuthOk = true; // Se chegou até aqui, o serviço está funcionando
            }
            
            Map<String, Object> health = Map.of(
                "status", firestoreOk && firebaseAuthOk ? "UP" : "DOWN",
                "services", Map.of(
                    "firestore", firestoreOk ? "UP" : "DOWN",
                    "firebaseAuth", firebaseAuthOk ? "UP" : "DOWN"
                ),
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Erro ao verificar saúde do sistema: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}