package com.appunture.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
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

    @Value("${firebase.project-id:appunture-tcc}")
    private String projectId;

    @Value("${firebase.storage.bucket:appunture-tcc.appspot.com}")
    private String storageBucket;

    @Value("${app.firebase.enabled:true}")
    private boolean firebaseEnabled;

    // Firebase initialization is handled when creating the Firestore/Storage beans

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
            GoogleCredentials credentials = loadCredentials();
            if (credentials == null) {
                log.warn("Nenhuma credencial disponível para Firestore");
                return null;
            }

            FirestoreOptions options = FirestoreOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build();

            return options.getService();
        } catch (Exception e) {
            log.error("Erro ao criar instância do Firestore: {}", e.getMessage(), e);
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
            GoogleCredentials credentials = loadCredentials();
            if (credentials == null) {
                log.warn("Nenhuma credencial disponível para Firebase Storage");
                return null;
            }

            Storage storage = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build()
                    .getService();

            String bucketName = storageBucket;
            if (bucketName != null && bucketName.startsWith("gs://")) {
                bucketName = bucketName.substring(5);
            }

            return storage.get(bucketName);
        } catch (Exception e) {
            log.error("Erro ao obter bucket do Firebase Storage: {}", e.getMessage(), e);
            return null;
        }
    }
}