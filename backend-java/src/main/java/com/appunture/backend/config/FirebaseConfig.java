package com.appunture.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKey;

    @Value("${firebase.service-account-key-path:}")
    private String serviceAccountKeyPath;

    @Value("${firebase.project-id:appunture-tcc}")
    private String projectId;

    @Value("${firebase.storage.bucket:appunture-tcc.appspot.com}")
    private String storageBucket;

    @PostConstruct
    public void initializeFirebase() {
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
                    log.info("Removed 'gs://' prefix from storage bucket");
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setProjectId(projectId)
                        .setStorageBucket(bucket)
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully for project: {}", projectId);
            }
        } catch (Exception e) {
            log.error("Error initializing Firebase: {}", e.getMessage());
            log.warn("Firebase not configured, authentication will be disabled");
        }
    }

    private GoogleCredentials loadCredentials() throws IOException {
        // Priority 1: Direct service account key from config (JSON content)
        if (serviceAccountKey != null && !serviceAccountKey.isEmpty()) {
            log.info("Using credentials from firebase.service-account-key config");
            return GoogleCredentials.fromStream(
                new ByteArrayInputStream(serviceAccountKey.getBytes(StandardCharsets.UTF_8))
            );
        }
        
        // Priority 2: Service account key file path from config
        if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isEmpty()) {
            java.io.File credFile = new java.io.File(serviceAccountKeyPath);
            if (credFile.exists()) {
                log.info("Using credentials from firebase.service-account-key-path: {}", serviceAccountKeyPath);
                return GoogleCredentials.fromStream(new java.io.FileInputStream(credFile));
            } else {
                log.warn("Service account file not found at: {}", serviceAccountKeyPath);
            }
        }
        
        // Priority 3: GOOGLE_APPLICATION_CREDENTIALS env var
        String credentialsEnv = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsEnv != null && !credentialsEnv.isEmpty()) {
            // Check if it's JSON content (Cloud Run secrets) or a file path
            if (credentialsEnv.trim().startsWith("{")) {
                log.info("Using credentials from GOOGLE_APPLICATION_CREDENTIALS env var (JSON content)");
                return GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsEnv.getBytes(StandardCharsets.UTF_8))
                );
            } else {
                log.info("Using credentials from GOOGLE_APPLICATION_CREDENTIALS file path: {}", credentialsEnv);
                return GoogleCredentials.getApplicationDefault();
            }
        }
        
        // Priority 4: Application Default Credentials
        log.info("Using Application Default Credentials");
        return GoogleCredentials.getApplicationDefault();
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        try {
            return FirebaseAuth.getInstance();
        } catch (Exception e) {
            log.warn("Firebase Auth not available: {}", e.getMessage());
            return null;
        }
    }

    @Bean
    public String firebaseStorageBucket() {
        return storageBucket;
    }
}