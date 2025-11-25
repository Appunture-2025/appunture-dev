package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final ChatClient.Builder chatClientBuilder;
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

    public String sendMessage(String userMessage) {
        String systemPrompt = """
            Você é o assistente virtual oficial do Appunture.
            Sua função é ajudar acupunturistas e estudantes.
            
            REGRAS RÍGIDAS:
            1. Use EXCLUSIVAMENTE as informações fornecidas abaixo no 'Contexto de Dados'.
            2. Se a resposta não estiver nos dados, diga: "Desculpe, não tenho informações sobre isso na minha base de dados oficial."
            3. Não responda sobre política, futebol, programação ou assuntos fora de acupuntura.
            4. Seja conciso e profissional.
            
            CONTEXTO DE DADOS:
            """ + buildSystemContext();

        ChatClient chatClient = chatClientBuilder.build();
        return chatClient.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .content();
    }
}
