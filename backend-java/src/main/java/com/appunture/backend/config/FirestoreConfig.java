package com.appunture.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirestoreConfig {

    @Value("${firebase.service-account-key-path:}")
    private String serviceAccountKeyPath;

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    @Value("${app.firebase.enabled:true}")
    private boolean firebaseEnabled;

    @PostConstruct
    public void initializeFirebase() {
        if (!firebaseEnabled) {
            log.info("Firebase desabilitado - modo desenvolvimento");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = loadCredentials();
                
                if (credentials == null) {
                    log.warn("No credentials available, Firebase will not be initialized");
                    return;
                }

                // Remove 'gs://' prefix if present (Firebase SDK doesn't accept it)
                String bucket = storageBucket;
                if (bucket != null && bucket.startsWith("gs://")) {
                    bucket = bucket.substring(5);
                    log.info("Removido prefixo 'gs://' do storage bucket");
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setProjectId(projectId)
                        .setStorageBucket(bucket)
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase inicializado com sucesso - Projeto: {}", projectId);
            }
        } catch (Exception e) {
            log.error("Erro ao inicializar Firebase: {}", e.getMessage(), e);
            throw new RuntimeException("Falha na inicialização do Firebase", e);
        }
    }

    private GoogleCredentials loadCredentials() throws IOException {
        // Priority 1: GOOGLE_APPLICATION_CREDENTIALS env var
        String credentialsEnv = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsEnv != null && !credentialsEnv.isEmpty()) {
            // Check if it's JSON content (Cloud Run secrets) or a file path
            if (credentialsEnv.trim().startsWith("{")) {
                log.info("Usando credenciais do GOOGLE_APPLICATION_CREDENTIALS (conteúdo JSON)");
                return GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsEnv.getBytes(StandardCharsets.UTF_8))
                );
            } else {
                log.info("Usando credenciais do arquivo GOOGLE_APPLICATION_CREDENTIALS: {}", credentialsEnv);
                return GoogleCredentials.getApplicationDefault();
            }
        }
        
        // Priority 2: File path from config
        if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isEmpty()) {
            log.info("Usando credenciais do arquivo configurado: {}", serviceAccountKeyPath);
            try (InputStream serviceAccount = new FileInputStream(serviceAccountKeyPath)) {
                return GoogleCredentials.fromStream(serviceAccount);
            }
        }
        
        // Priority 3: Application Default Credentials
        log.info("Usando Application Default Credentials");
        return GoogleCredentials.getApplicationDefault();
    }

    @Bean
    public Firestore firestore() {
        if (!firebaseEnabled) {
            log.warn("Firestore desabilitado - retornando null");
            return null;
        }
        
        try {
            return FirestoreClient.getFirestore();
        } catch (Exception e) {
            log.error("Erro ao obter instância do Firestore: {}", e.getMessage(), e);
            return null;
        }
    }

    @Bean
    public Bucket firebaseStorageBucketClient() {
        if (!firebaseEnabled) {
            log.warn("Firebase Storage desabilitado - retornando null");
            return null;
        }
        
        try {
            return StorageClient.getInstance().bucket();
        } catch (Exception e) {
            log.error("Erro ao obter bucket do Firebase Storage: {}", e.getMessage(), e);
            return null;
        }
    }
}