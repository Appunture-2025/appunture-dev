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
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

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
                GoogleCredentials credentials;
                
                // Prioridade: variável de ambiente > arquivo específico > default
                if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null) {
                    log.info("Usando credenciais da variável de ambiente GOOGLE_APPLICATION_CREDENTIALS");
                    credentials = GoogleCredentials.getApplicationDefault();
                } else if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isEmpty()) {
                    log.info("Usando credenciais do arquivo: {}", serviceAccountKeyPath);
                    try (InputStream serviceAccount = new FileInputStream(serviceAccountKeyPath)) {
                        credentials = GoogleCredentials.fromStream(serviceAccount);
                    }
                } else {
                    log.info("Usando credenciais padrão do ambiente");
                    credentials = GoogleCredentials.getApplicationDefault();
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setProjectId(projectId)
                        .setStorageBucket(storageBucket)
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase inicializado com sucesso - Projeto: {}", projectId);
            }
        } catch (IOException e) {
            log.error("Erro ao inicializar Firebase: {}", e.getMessage(), e);
            throw new RuntimeException("Falha na inicialização do Firebase", e);
        }
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
    public Bucket firebaseStorageBucket() {
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