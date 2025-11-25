# 🤖 Prompts para Implementação do Chatbot IA (Spring AI + Gemini)

Este arquivo contém os prompts prontos para serem executados por uma IA ou desenvolvedor para implementar o chatbot inteligente no Appunture.

## 1. Backend (Java Spring Boot)

**Objetivo:** Configurar Spring AI, conectar ao Google Gemini (Flash 1.5) e criar a lógica RAG (Retrieval-Augmented Generation).

````markdown
Atue como um Arquiteto de Software Java Spring Boot. Sua tarefa é implementar um Chatbot de IA no projeto `backend-java` usando **Spring AI** e **Google Gemini (Flash 1.5)**.

O objetivo é criar um endpoint que receba uma pergunta, busque o contexto de acupuntura no Firestore (Pontos e Sintomas), injete esse contexto no prompt do sistema e retorne a resposta da IA.

Siga estritamente estes passos:

1. **Dependências (`pom.xml`):**

   - Adicione o BOM do Spring AI: `org.springframework.ai:spring-ai-bom:1.0.0-SNAPSHOT` (seção dependencyManagement).
   - Adicione a dependência starter: `org.springframework.ai:spring-ai-google-ai-gemini-spring-boot-starter`.
   - Adicione o repositório `spring-milestones` se necessário.

2. **Configuração (`application.yml`):**

   - Configure a chave da API e o modelo. Use variáveis de ambiente para a chave.

   ```yaml
   spring:
     ai:
       google:
         ai:
           gemini:
             api-key: ${GOOGLE_AI_API_KEY}
             options:
               model: gemini-1.5-flash
               temperature: 0.3 # Baixa criatividade para evitar alucinações
   ```

3. **Service (`AiChatService.java`):**

   - Crie este serviço injetando `ChatClient`, `PointService` e `SymptomService`.
   - Crie um método privado `buildSystemContext()` que:
     - Busque todos os pontos (`pointService.findAll()`) e sintomas (`symptomService.findAll()`).
     - Formate-os em uma String única e organizada (ex: "Ponto: IG4, Função: Dor de cabeça...").
   - Crie o método público `sendMessage(String userMessage)`:
     - Defina o **System Prompt**: "Você é o assistente oficial do Appunture. Responda APENAS com base nos dados abaixo. Se não souber, diga que não sabe. Dados: [CONTEXTO_GERADO]".
     - Chame o `chatClient` passando o System Prompt e a mensagem do usuário.
     - Retorne a resposta (String).

4. **Controller (`AiChatController.java`):**

   - Crie o endpoint `POST /api/chat`.
   - Payload esperado: `{ "message": "O que é bom para dor de cabeça?" }`.
   - Resposta esperada: `{ "response": "O ponto IG4 é indicado para..." }`.
   - Garanta que o endpoint exija autenticação (SecurityConfig).

5. **Variáveis de Ambiente:**
   - Lembre-me de adicionar `GOOGLE_AI_API_KEY` no arquivo `.env` ou nas configurações de execução.
````

## 2. Frontend (React Native / Expo)

**Objetivo:** Conectar o app ao novo endpoint de IA e remover a lógica local antiga.

```markdown
Atue como um Especialista em React Native e Expo. Sua tarefa é integrar o Chatbot do `frontend-mobile` com a nova API de Inteligência Artificial do backend.

Siga estritamente estes passos:

1. **Atualizar API Service (`services/api.ts`):**

   - Adicione um método `chatWithAi(message: string): Promise<string>`.
   - Ele deve fazer um `POST` para `/api/chat` enviando o JSON `{ "message": message }`.
   - Trate erros (ex: servidor offline, erro 500) retornando uma mensagem amigável de fallback.

2. **Refatorar a Tela de Chat (ou Componente):**

   - Identifique onde o chat está implementado (provavelmente em `app/(tabs)/chat.tsx` ou `components/ChatBubble.tsx`).
   - **Remova** qualquer lógica local de NLP (ex: `services/nlp.ts` ou `if/else` com palavras-chave). O chat agora é 100% servidor.
   - Implemente o estado de **Loading**:
     - Quando o usuário enviar a mensagem, mostre imediatamente um balão "Digitando..." ou um `ActivityIndicator`.
     - Desabilite o input enquanto aguarda a resposta.
   - Ao receber a resposta da API, adicione-a à lista de mensagens.

3. **Renderização:**

   - A resposta do Gemini virá em formato **Markdown** (pode conter negrito, listas).
   - Se possível, use uma biblioteca como `react-native-markdown-display` para renderizar a resposta bonitinha, ou apenas exiba o texto puro por enquanto se não quiser adicionar libs novas.

4. **Limpeza:**
   - Pode excluir o arquivo `services/nlp.ts` se ele não for mais usado, pois a inteligência agora é remota.
```
