package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI Chat Service - Provides AI-powered chat functionality.
 * 
 * Note: This service requires Spring AI dependencies (spring-ai-vertex-ai-gemini-spring-boot-starter)
 * which may not be available in all environments. When Spring AI is not available, the service
 * returns a fallback message indicating AI features are not enabled.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;

    // Cache simples para não ler o Firestore a cada pergunta
    private String cachedContext = "";

    private String buildSystemContext() {
        if (cachedContext.isEmpty()) {
            // 1. Busca dados brutos
            List<FirestorePoint> points = pointService.findAll();
            List<FirestoreSymptom> symptoms = symptomService.findAll();

            // 2. Formata como texto para a IA ler
            StringBuilder sb = new StringBuilder();
            sb.append("DADOS DO SISTEMA APPUNTURE:\n");
            sb.append("=== PONTOS DE ACUPUNTURA ===\n");
            for (FirestorePoint p : points) {
                sb.append(String.format("- %s: %s (Local: %s)\n", p.getName(), p.getDescription(), p.getLocation()));
            }

            sb.append("\n=== SINTOMAS TRATÁVEIS ===\n");
            for (FirestoreSymptom s : symptoms) {
                sb.append(String.format("- %s: %s\n", s.getName(), s.getDescription()));
            }

            cachedContext = sb.toString();
        }
        return cachedContext;
    }

    /**
     * Sends a message to the AI chat service.
     * 
     * Note: This method currently returns a fallback message as Spring AI dependencies
     * are not available. To enable AI features, add spring-ai-vertex-ai-gemini-spring-boot-starter
     * to the pom.xml and configure the GOOGLE_AI_API_KEY environment variable.
     */
    public String sendMessage(String userMessage) {
        log.info("AI Chat request received: {}", userMessage);
        
        // AI features are currently disabled due to Spring AI dependencies not being available
        // When Spring AI is configured, this method will use the ChatClient to generate responses
        String context = buildSystemContext();
        log.debug("Context built with {} characters", context.length());
        
        return "O recurso de IA está temporariamente indisponível. " +
               "Por favor, utilize os recursos de busca do aplicativo para encontrar pontos de acupuntura e sintomas. " +
               "Para mais informações, consulte a documentação ou entre em contato com o suporte.";
    }
}
