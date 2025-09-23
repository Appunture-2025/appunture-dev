package com.appunture.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthService {

    private final FirebaseAuth firebaseAuth;

    /**
     * Verifica e decodifica um token ID do Firebase
     */
    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        return firebaseAuth.verifyIdToken(idToken);
    }

    /**
     * Busca um usuário pelo UID
     */
    public UserRecord getUserByUid(String uid) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        return firebaseAuth.getUser(uid);
    }

    /**
     * Busca um usuário pelo email
     */
    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        return firebaseAuth.getUserByEmail(email);
    }

    /**
     * Cria um novo usuário no Firebase
     */
    public UserRecord createUser(String email, String password, String displayName) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);

        return firebaseAuth.createUser(request);
    }

    /**
     * Atualiza um usuário no Firebase
     */
    public UserRecord updateUser(String uid, String email, String displayName) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        
        UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                .setEmail(email)
                .setDisplayName(displayName);

        return firebaseAuth.updateUser(request);
    }

    /**
     * Define custom claims para um usuário (ex: role)
     */
    public void setCustomClaims(String uid, Map<String, Object> claims) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        firebaseAuth.setCustomUserClaims(uid, claims);
    }

    /**
     * Define role de um usuário
     */
    public void setUserRole(String uid, String role) throws FirebaseAuthException {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        setCustomClaims(uid, claims);
    }

    /**
     * Deleta um usuário do Firebase
     */
    public void deleteUser(String uid) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        firebaseAuth.deleteUser(uid);
    }

    /**
     * Gera um link de verificação de email
     */
    public String generateEmailVerificationLink(String email) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        return firebaseAuth.generateEmailVerificationLink(email);
    }

    /**
     * Gera um link de reset de senha
     */
    public String generatePasswordResetLink(String email) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }
        return firebaseAuth.generatePasswordResetLink(email);
    }

    /**
     * Verifica se o Firebase Auth está disponível
     */
    public boolean isAvailable() {
        return firebaseAuth != null;
    }
}