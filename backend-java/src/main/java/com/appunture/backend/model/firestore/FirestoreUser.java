package com.appunture.backend.model.firestore;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirestoreUser {
    
    // NOTA: Removido @DocumentId pois os documentos já têm campo 'id' armazenado explicitamente
    private String id; // Firestore document ID
    
    private String firebaseUid; // UID do Firebase Auth
    private String email;
    private String name;
    private String role; // USER, ADMIN
    private boolean enabled;
    private Date createdAt; // Usando Date para compatibilidade com Firestore
    private Date updatedAt;
    
    // Métodos auxiliares para conversão de datas
    public LocalDateTime getCreatedAtAsLocalDateTime() {
        return createdAt != null ? createdAt.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime() : null;
    }
    
    public LocalDateTime getUpdatedAtAsLocalDateTime() {
        return updatedAt != null ? updatedAt.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime() : null;
    }
    
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