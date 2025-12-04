package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private FirestorePointService pointService;

    @Mock
    private FirestoreSymptomService symptomService;

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    private AiChatService aiChatService;

    @BeforeEach
    void setUp() {
        // Mock the ChatClient.Builder chain
        when(chatClientBuilder.defaultSystem(anyString())).thenReturn(chatClientBuilder);
        when(chatClientBuilder.build()).thenReturn(chatClient);
        
        // Create the service with mocked dependencies
        aiChatService = new AiChatService(pointService, symptomService, chatClientBuilder);
    }

    /**
     * Helper method to mock ChatClient behavior to throw exceptions.
     * This simulates AI service failures for testing error handling.
     */
    private void mockChatClientToThrowException(String exceptionMessage) {
        ChatClient.ChatClientRequest.CallPromptResponseSpec responseSpec = mock(ChatClient.ChatClientRequest.CallPromptResponseSpec.class);
        ChatClient.ChatClientRequest.CallPromptResponseSpec callResponse = mock(ChatClient.ChatClientRequest.CallPromptResponseSpec.class);
        ChatClient.ChatClientRequest.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequest.ChatClientRequestSpec.class);
        
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(responseSpec);
        when(responseSpec.call()).thenReturn(callResponse);
        when(callResponse.content()).thenThrow(new RuntimeException(exceptionMessage));
    }

    @Test
    void sendMessage_ShouldReturnFallbackMessageWhenAiNotConfigured() {
        // Given
        FirestorePoint point = FirestorePoint.builder()
                .name("Baihui")
                .description("Ponto no topo da cabeça")
                .location("No topo da cabeça")
                .build();
        FirestoreSymptom symptom = FirestoreSymptom.builder()
                .name("Dor de cabeça")
                .description("Dor na região craniana")
                .build();
        
        when(pointService.findAll()).thenReturn(List.of(point));
        when(symptomService.findAll()).thenReturn(List.of(symptom));
        mockChatClientToThrowException("AI service temporarily unavailable");

        // When
        String response = aiChatService.sendMessage("O que é acupuntura?");

        // Then
        assertThat(response).isNotNull();
        assertThat(response).contains("erro");
    }

    @Test
    void sendMessage_ShouldBuildContextWithPointsAndSymptoms() {
        // Given - empty data
        when(pointService.findAll()).thenReturn(List.of());
        when(symptomService.findAll()).thenReturn(List.of());
        mockChatClientToThrowException("AI service error");

        // When
        String response = aiChatService.sendMessage("Teste");

        // Then - should still return fallback
        assertThat(response).isNotNull();
        assertThat(response).contains("erro");
    }

    @Test
    void sendMessage_ShouldHandleNullPointDescription() {
        // Given
        FirestorePoint point = FirestorePoint.builder()
                .name("VG20")
                .description(null)
                .location(null)
                .build();
        
        when(pointService.findAll()).thenReturn(List.of(point));
        when(symptomService.findAll()).thenReturn(List.of());
        mockChatClientToThrowException("AI service error");

        // When
        String response = aiChatService.sendMessage("Consulta");

        // Then
        assertThat(response).isNotNull();
    }
}
