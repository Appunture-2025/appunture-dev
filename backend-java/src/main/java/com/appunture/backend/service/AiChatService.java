package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI Chat Service - Provides AI-powered chat functionality using Spring AI with Google Gemini.
 * 
 * This service implements a RAG (Retrieval-Augmented Generation) pattern:
 * 1. Retrieves relevant context from the Firestore database (points and symptoms)
 * 2. Builds an enriched prompt with the context
 * 3. Sends the prompt to Google Gemini via Spring AI
 * 4. Returns contextualized responses about acupuncture
 */
@Service
@Slf4j
public class AiChatService {

    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;
    private final ChatClient chatClient;
    
    // Cache simples para não ler o Firestore a cada pergunta
    private String cachedContext = "";
    
    private static final String SYSTEM_PROMPT = """
        Você é um assistente educativo especializado em acupuntura tradicional chinesa.
        Seu papel é ajudar estudantes e praticantes a entender os pontos de acupuntura,
        suas localizações, indicações terapêuticas e relações com sintomas.
        
        IMPORTANTE:
        - Forneça informações educativas baseadas APENAS nos dados do sistema Appunture
        - Não faça diagnósticos médicos nem prescreva tratamentos
        - Sempre recomende que o usuário consulte um profissional qualificado
        - Se não souber a resposta com base nos dados fornecidos, diga claramente
        - Seja conciso e objetivo nas respostas
        
        Use os dados do sistema fornecidos abaixo para contextualizar suas respostas.
        """;

    @Autowired
    public AiChatService(FirestorePointService pointService, 
                         FirestoreSymptomService symptomService,
                         ChatClient.Builder chatClientBuilder) {
        this.pointService = pointService;
        this.symptomService = symptomService;
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }

    private String buildSystemContext() {
        if (cachedContext.isEmpty()) {
            try {
                // 1. Busca dados brutos
                List<FirestorePoint> points = pointService.findAll();
                List<FirestoreSymptom> symptoms = symptomService.findAll();

                // 2. Formata como texto para a IA ler
                StringBuilder sb = new StringBuilder();
                sb.append("DADOS DO SISTEMA APPUNTURE:\n");
                sb.append("=== PONTOS DE ACUPUNTURA ===\n");
                for (FirestorePoint p : points) {
                    sb.append(String.format("- %s: %s (Local: %s)\n", 
                        p.getName(), 
                        p.getDescription() != null ? p.getDescription() : "Sem descrição",
                        p.getLocation() != null ? p.getLocation() : "Localização não especificada"));
                }

                sb.append("\n=== SINTOMAS TRATÁVEIS ===\n");
                for (FirestoreSymptom s : symptoms) {
                    sb.append(String.format("- %s: %s\n", 
                        s.getName(),
                        s.getDescription() != null ? s.getDescription() : "Sem descrição"));
                }

                cachedContext = sb.toString();
                log.info("Context cache built with {} points and {} symptoms", points.size(), symptoms.size());
            } catch (Exception e) {
                log.error("Error building context from Firestore: {}", e.getMessage());
                cachedContext = "DADOS DO SISTEMA: Não foi possível carregar os dados do banco de dados.";
            }
        }
        return cachedContext;
    }
    
    /**
     * Clears the cached context, forcing a refresh on the next request.
     */
    public void clearCache() {
        this.cachedContext = "";
        log.info("AI context cache cleared");
    }

    /**
     * Sends a message to the AI chat service using RAG pattern.
     * 
     * @param userMessage The user's question about acupuncture
     * @return AI-generated response contextualized with Appunture data
     */
    public String sendMessage(String userMessage) {
        log.info("AI Chat request received: {}", userMessage);
        
        try {
            // Build context from database (RAG retrieval phase)
            String context = buildSystemContext();
            log.debug("Context built with {} characters", context.length());
            
            // Build enriched prompt with context (RAG augmentation phase)
            String enrichedPrompt = String.format("""
                CONTEXTO DO SISTEMA:
                %s
                
                PERGUNTA DO USUÁRIO:
                %s
                
                Por favor, responda à pergunta do usuário com base no contexto fornecido.
                """, context, userMessage);
            
            // Call AI model (RAG generation phase)
            String response = chatClient.prompt()
                    .user(enrichedPrompt)
                    .call()
                    .content();
            
            log.info("AI response generated successfully");
            return response;
            
        } catch (Exception e) {
            log.error("Error calling AI service: {}", e.getMessage(), e);
            return "Desculpe, ocorreu um erro ao processar sua pergunta. " +
                   "Por favor, tente novamente ou utilize os recursos de busca do aplicativo. " +
                   "Erro: " + e.getMessage();
        }
    }
}
