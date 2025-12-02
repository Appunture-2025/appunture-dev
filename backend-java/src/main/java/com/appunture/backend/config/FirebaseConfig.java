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

    @Value("${firebase.project-id:appunture-tcc}")
    private String projectId;

    @Value("${firebase.storage.bucket:appunture-tcc.appspot.com}")
    private String storageBucket;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials;
                
                if (serviceAccountKey != null && !serviceAccountKey.isEmpty()) {
                    // Usa service account key se fornecida
                    ByteArrayInputStream stream = new ByteArrayInputStream(
                        serviceAccountKey.getBytes(StandardCharsets.UTF_8)
                    );
                    credentials = GoogleCredentials.fromStream(stream);
                } else {
                    // Usa Application Default Credentials (para desenvolvimento local e produção)
                    credentials = GoogleCredentials.getApplicationDefault();
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
        } catch (IOException e) {
            log.error("Error initializing Firebase: {}", e.getMessage());
            // Para desenvolvimento, continue sem Firebase se não configurado
            log.warn("Firebase not configured, authentication will be disabled");
        }
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