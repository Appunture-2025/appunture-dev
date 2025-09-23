package com.appunture.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token; // Pode ser null quando usando Firebase
    private String email;
    private String name;
    private String role;
    private String message; // Mensagem de resposta
    private String firebaseUid; // UID do Firebase
    private Boolean isEmailVerified; // Status de verificação do email
}
