package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AiChatService {

    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;
    private final ChatClient chatClient;
    
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
                List<FirestorePoint> points = pointService.findAll();
                List<FirestoreSymptom> symptoms = symptomService.findAll();

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
    
    public void clearCache() {
        this.cachedContext = "";
        log.info("AI context cache cleared");
    }

    public String sendMessage(String userMessage) {
        log.info("AI Chat request received: {}", userMessage);
        
        try {
            String context = buildSystemContext();
            log.debug("Context built with {} characters", context.length());
            
            String enrichedPrompt = String.format("""
                CONTEXTO DO SISTEMA:
                %s
                
                PERGUNTA DO USUÁRIO:
                %s
                
                Por favor, responda à pergunta do usuário com base no contexto fornecido.
                """, context, userMessage);
            
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
