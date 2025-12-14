package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatOptions;
import org.springframework.stereotype.Service;

import com.google.cloud.vertexai.VertexAI;
import com.google.auth.oauth2.GoogleCredentials;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Slf4j
public class AiChatService {

    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;
    private ChatClient chatClient;

    private String cachedContext = "";

    /*
     * =========================
     * SYSTEM PROMPT (OFICIAL)
     * =========================
     */
    private static final String SYSTEM_PROMPT = """
            Você é um assistente educacional especializado em Acupuntura Tradicional Chinesa (ATC).

            Seu objetivo é auxiliar estudantes e praticantes a compreender:
            - Pontos de acupuntura
            - Localização anatômica
            - Indicações terapêuticas
            - Relação entre pontos, meridianos e sintomas
            - Fundamentos teóricos da Medicina Tradicional Chinesa

            DIRETRIZES GERAIS:
            - Forneça exclusivamente informações educativas e informativas.
            - Utilize prioritariamente os dados internos do sistema Appunture.
            - Caso a informação não exista no sistema, complemente com literatura clássica e fontes confiáveis da área.
            - Não realize diagnósticos médicos.
            - Não prescreva tratamentos, protocolos clínicos ou condutas individualizadas.
            - Nunca descreva técnicas de agulhamento, profundidade ou ângulo de inserção.
            - Sempre informe que a prática da acupuntura deve ser realizada por profissional qualificado.
            - Caso a informação não seja confiável ou não esteja disponível, deixe isso explícito.
            - Priorize informações baseadas em consenso da literatura e prática tradicional reconhecida.
            - Seja claro, objetivo e evite respostas prolixas.

            SEGURANÇA E CONTRAINDICAÇÕES:
            - Perguntas relacionadas a riscos, contraindicações, segurança ou pontos potencialmente perigosos são permitidas exclusivamente em caráter educacional.
            - Para essas perguntas, utilize conhecimento consolidado da literatura clássica de Acupuntura e anatomia básica, mesmo que os dados não estejam explicitamente presentes no sistema.
            - Limite-se a explicar POR QUE certos pontos são considerados potencialmente perigosos, mencionando apenas estruturas anatômicas próximas.
            - Nunca incentive a prática por leigos ou fora do contexto profissional.

            FORMATO E TAMANHO DAS RESPOSTAS:
            - Sempre priorize respostas curtas, diretas e estruturadas.
            - Quando a pergunta puder gerar respostas extensas (ex: listas, riscos, principais pontos, pontos perigosos, contraindicações):
              - Responda automaticamente no formato de TOP LISTA.
              - Utilize TOP 5 como padrão.
              - Utilize TOP 10 apenas se explicitamente solicitado ou se TOP 5 for insuficiente.
              - Cada item deve conter no máximo 1 frase curta e objetiva.
            - Evite introduções longas ou explicações extensas antes da lista.
            - Não enumere todos os pontos possíveis; selecione apenas os mais relevantes.

            DETECÇÃO AUTOMÁTICA DE SÍNTESE:
            - Perguntas iniciadas por “quais”, “liste”, “principais”, “mais perigosos”, “mais importantes”, ou termos semelhantes devem ser interpretadas como pedidos de síntese.
            - Nestes casos, responda automaticamente em formato resumido (TOP 5), mesmo que o usuário não solicite explicitamente.

            ESCOPO:
            - Perguntas fora do escopo da Acupuntura Tradicional Chinesa devem ser recusadas educadamente.

            Utilize os dados do sistema fornecidos abaixo como principal fonte de contexto para suas respostas.
            """;

    /*
     * =========================
     * CONSTRUTOR
     * =========================
     */
    public AiChatService(FirestorePointService pointService,
            FirestoreSymptomService symptomService) {

        this.pointService = pointService;
        this.symptomService = symptomService;

        log.info("[AI] Initializing AiChatService");

        String credentialsPath = "D:\\_repos\\appunture-dev\\serviceAccount.json";
        System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
        System.setProperty("GOOGLE_CLOUD_PROJECT", "appunture-tcc");
        System.setProperty("GOOGLE_CLOUD_LOCATION", "us-central1");

        try {
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(new java.io.FileInputStream(credentialsPath))
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");

            VertexAI vertexAI = new VertexAI.Builder()
                    .setProjectId("appunture-tcc")
                    .setLocation("us-central1")
                    .setCredentials(credentials)
                    .build();

            VertexAiGeminiChatOptions options = VertexAiGeminiChatOptions.builder()
                    .withModel("gemini-2.5-flash")
                    .withTemperature(0.3)
                    .build();

            VertexAiGeminiChatModel chatModel = new VertexAiGeminiChatModel(vertexAI, options);

            this.chatClient = ChatClient.builder(chatModel).build();

            log.info("[AI] ChatClient initialized successfully");

        } catch (Exception e) {
            log.error("[AI] Failed to initialize AI service", e);
            throw new RuntimeException("Vertex AI initialization failed", e);
        }
    }

    /*
     * =========================
     * CONTEXTO DO SISTEMA
     * =========================
     */
    private String buildSystemContext() {

        if (!cachedContext.isEmpty()) {
            return cachedContext;
        }

        try {
            List<FirestorePoint> points = pointService.findAll();
            List<FirestoreSymptom> symptoms = symptomService.findAll();

            StringBuilder sb = new StringBuilder();
            sb.append("DADOS DO SISTEMA APPUNTURE:\n\n");

            sb.append("=== PONTOS DE ACUPUNTURA ===\n");
            if (points != null) {
                for (FirestorePoint p : points) {
                    sb.append(String.format(
                            "- %s: %s | Localização: %s\n",
                            p.getName(),
                            p.getDescription() != null ? p.getDescription() : "Sem descrição",
                            p.getLocation() != null ? p.getLocation() : "Não especificada"));
                }
            }

            sb.append("\n=== SINTOMAS ===\n");
            if (symptoms != null) {
                for (FirestoreSymptom s : symptoms) {
                    sb.append(String.format(
                            "- %s: %s\n",
                            s.getName(),
                            s.getDescription() != null ? s.getDescription() : "Sem descrição"));
                }
            }

            cachedContext = sb.toString();
            return cachedContext;

        } catch (Exception e) {
            log.error("[AI] Failed to build system context", e);
            return "DADOS DO SISTEMA: Não foi possível carregar informações.";
        }
    }

    /*
     * =========================
     * MÉTODO PRINCIPAL
     * =========================
     */
    public String sendMessage(String userMessage) {

        if (chatClient == null) {
            return "Erro: Serviço de IA não inicializado.";
        }

        String context = buildSystemContext();

        String enrichedPrompt = """
                CONTEXTO DO SISTEMA:
                %s

                PERGUNTA DO USUÁRIO:
                %s

                Responda de forma educativa, clara e objetiva, respeitando as diretrizes de segurança.
                """.formatted(context, userMessage);

        try {
            return chatClient.prompt()
                    .system(SYSTEM_PROMPT) // 🔥 AQUI ESTÁ A CORREÇÃO MAIS IMPORTANTE
                    .user(enrichedPrompt)
                    .call()
                    .content();

        } catch (Exception e) {
            log.error("[AI] Error while processing message", e);
            return "Ocorreu um erro ao processar sua pergunta.";
        }
    }

    /*
     * =========================
     * SAÚDE DO SERVIÇO
     * =========================
     */
    public Map<String, String> getHealthStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "AiChatService");
        status.put("chatClient", chatClient != null ? "OK" : "NULL");
        status.put("pointService", pointService != null ? "OK" : "NULL");
        status.put("symptomService", symptomService != null ? "OK" : "NULL");
        return status;
    }

    public void clearCache() {
        cachedContext = "";
        log.info("[AI] Context cache cleared");
    }
}
