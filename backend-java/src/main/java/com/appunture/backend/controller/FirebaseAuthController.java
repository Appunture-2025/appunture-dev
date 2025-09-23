package com.appunture.backend.controller;

import com.appunture.backend.dto.request.RegisterRequest;
import com.appunture.backend.dto.response.AuthResponse;
import com.appunture.backend.service.FirebaseAuthService;
import com.appunture.backend.service.UserService;
import com.appunture.backend.entity.User;
import com.google.firebase.auth.UserRecord;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Firebase Authentication", description = "Endpoints de autenticação com Firebase")
public class FirebaseAuthController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria conta no Firebase e salva dados no banco local")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Verificar se email já existe no banco local
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Email already registered in local database"));
            }

            // Criar usuário no Firebase
            UserRecord firebaseUser = firebaseAuthService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getName()
            );

            // Definir role padrão
            String role = "USER";
            firebaseAuthService.setUserRole(firebaseUser.getUid(), role);

            // Criar usuário no banco local
            User localUser = userService.createUser(
                request.getEmail(),
                "", // Senha não é necessária pois usamos Firebase
                request.getName(),
                request.getProfession(),
                "ROLE_" + role
            );

            // Adicionar UID do Firebase ao usuário local
            localUser.setFirebaseUid(firebaseUser.getUid());
            userService.save(localUser);

            AuthResponse response = AuthResponse.builder()
                .message("User registered successfully")
                .email(firebaseUser.getEmail())
                .name(firebaseUser.getDisplayName())
                .role(role)
                .firebaseUid(firebaseUser.getUid())
                .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-token")
    @Operation(summary = "Verificar token Firebase", description = "Valida token ID do Firebase")
    public ResponseEntity<?> verifyToken(@RequestBody TokenRequest request) {
        try {
            var decodedToken = firebaseAuthService.verifyToken(request.getIdToken());
            
            // Buscar usuário local pelo UID do Firebase
            User localUser = userService.findByFirebaseUid(decodedToken.getUid())
                .orElse(null);

            AuthResponse response = AuthResponse.builder()
                .message("Token is valid")
                .email(decodedToken.getEmail())
                .name(decodedToken.getName())
                .role(localUser != null ? localUser.getRole() : "ROLE_USER")
                .firebaseUid(decodedToken.getUid())
                .isEmailVerified(decodedToken.isEmailVerified())
                .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error verifying token: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Invalid token: " + e.getMessage()));
        }
    }

    @PostMapping("/send-email-verification")
    @Operation(summary = "Enviar link de verificação de email")
    public ResponseEntity<?> sendEmailVerification(@RequestBody EmailRequest request) {
        try {
            String verificationLink = firebaseAuthService.generateEmailVerificationLink(request.getEmail());
            
            // Aqui você pode integrar com um serviço de email se necessário
            log.info("Email verification link generated for {}: {}", request.getEmail(), verificationLink);
            
            return ResponseEntity.ok(new MessageResponse("Email verification link sent"));

        } catch (Exception e) {
            log.error("Error sending email verification: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to send verification email: " + e.getMessage()));
        }
    }

    @PostMapping("/send-password-reset")
    @Operation(summary = "Enviar link de reset de senha")
    public ResponseEntity<?> sendPasswordReset(@RequestBody EmailRequest request) {
        try {
            String resetLink = firebaseAuthService.generatePasswordResetLink(request.getEmail());
            
            // Aqui você pode integrar com um serviço de email se necessário
            log.info("Password reset link generated for {}: {}", request.getEmail(), resetLink);
            
            return ResponseEntity.ok(new MessageResponse("Password reset link sent"));

        } catch (Exception e) {
            log.error("Error sending password reset: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to send password reset email: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Status do Firebase Auth")
    public ResponseEntity<?> getAuthStatus() {
        boolean available = firebaseAuthService.isAvailable();
        return ResponseEntity.ok(new StatusResponse("Firebase Auth", available));
    }

    // DTOs internos
    public static record TokenRequest(String idToken) {}
    public static record EmailRequest(String email) {}
    public static record ErrorResponse(String error) {}
    public static record MessageResponse(String message) {}
    public static record StatusResponse(String service, boolean available) {}
}