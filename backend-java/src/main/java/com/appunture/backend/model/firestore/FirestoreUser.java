package com.appunture.backend.model.firestore;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirestoreUser {
    
    @DocumentId
    private String id; // Firestore document ID
    
    private String firebaseUid; // UID do Firebase Auth
    private String email;
    private String name;
    private String role; // USER, ADMIN
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Favoritos como lista de IDs dos pontos
    private List<String> favoritePointIds;
    
    // Metadados do perfil
    private String profileImageUrl;
    private String phoneNumber;
    private boolean emailVerified;
    
    // FCM Push Notification Token
    private String fcmToken;
    private List<String> notificationTopics;
    
    // Campos para compatibilidade com backend antigo
    private String password; // Mantido para migração, mas não usado (Firebase Auth gerencia)
    
    // Método de conveniência para verificar se é admin
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
    
    // Método de conveniência para verificar se é usuário comum
    public boolean isUser() {
        return "USER".equalsIgnoreCase(role);
    }
}