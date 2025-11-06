package com.appunture.backend.service;

import com.appunture.backend.exception.RateLimitExceededException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthService {

    private final FirebaseAuth firebaseAuth;
    private final EmailService emailService;

    private static final long VERIFICATION_RETRY_LIMIT = 3;
    private static final String RATE_LIMIT_MESSAGE = "Limite de reenvios atingido. Tente novamente em 1 hora.";
    private static final Duration VERIFICATION_RETRY_PERIOD = Duration.ofHours(1);

    private final Map<String, Bucket> verificationBuckets = new ConcurrentHashMap<>();

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

    /**
     * Reenvia email de verificação com limitação de rate limit por usuário.
     */
    public void resendVerificationEmail(String uid) throws FirebaseAuthException {
        if (firebaseAuth == null) {
            throw new IllegalStateException("Firebase Auth not configured");
        }

        UserRecord user = firebaseAuth.getUser(uid);

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email já verificado");
        }

        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Usuário não possui email cadastrado");
        }

        Bucket bucket = verificationBuckets.computeIfAbsent(uid, key -> Bucket.builder()
            .addLimit(Bandwidth.classic(VERIFICATION_RETRY_LIMIT, Refill.intervally(VERIFICATION_RETRY_LIMIT, VERIFICATION_RETRY_PERIOD)))
            .build());

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for user {} when resending verification email", uid);
            throw new RateLimitExceededException(RATE_LIMIT_MESSAGE);
        }

        String verificationLink = firebaseAuth.generateEmailVerificationLink(email);
        emailService.sendVerificationEmail(email, verificationLink);
        log.info("Link de verificação reenviado para usuário {}", uid);
        log.debug("Tentativas restantes de reenvio para {}: {}", uid, bucket.getAvailableTokens());
    }
}