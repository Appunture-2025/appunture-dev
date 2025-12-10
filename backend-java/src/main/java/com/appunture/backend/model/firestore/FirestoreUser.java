package com.appunture.backend.model.firestore;

import com.google.cloud.Timestamp;
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
    private Object createdAt; // Usando Object para compatibilidade com Firestore
    private Object updatedAt;
    
    // Métodos auxiliares para conversão de datas
    public LocalDateTime getCreatedAtAsLocalDateTime() {
        return convertToLocalDateTime(createdAt);
    }
    
    public LocalDateTime getUpdatedAtAsLocalDateTime() {
        return convertToLocalDateTime(updatedAt);
    }
    
    private static LocalDateTime convertToLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        if (value instanceof Date) {
            return ((Date) value).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        if (value instanceof String) {
            try {
                return LocalDateTime.parse((String) value);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
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