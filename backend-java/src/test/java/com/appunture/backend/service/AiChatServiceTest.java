package com.appunture.backend.service;

import com.appunture.backend.config.AiConfiguration;
import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private FirestorePointService pointService;

    @Mock
    private FirestoreSymptomService symptomService;

    private AiChatService aiChatService;

    @BeforeEach
    void setUp() {
        // Create AI configuration with AI disabled for testing
        AiConfiguration aiConfig = new AiConfiguration();
        aiConfig.setEnabled(false);
        
        // Create service - should skip AI initialization when disabled
        aiChatService = new AiChatService(pointService, symptomService, aiConfig);
    }

    @Test
    void sendMessage_ShouldReturnErrorMessageWhenAiNotConfigured() {
        // Given - AI service in test environment (chatClient should be null)
        // When
        String response = aiChatService.sendMessage("O que é acupuntura?");
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response).isEqualTo("Erro: Serviço de IA não inicializado.");
    }

    @Test
    void getHealthStatus_ShouldReturnServiceStatus() {
        // When
        var status = aiChatService.getHealthStatus();
        
        // Then
        assertThat(status).isNotNull();
        assertThat(status).containsKey("service");
        assertThat(status.get("service")).isEqualTo("AiChatService");
        assertThat(status).containsKey("chatClient");
        assertThat(status.get("chatClient")).isEqualTo("NULL");
    }

    @Test
    void clearCache_ShouldExecuteWithoutErrors() {
        // When/Then - should not throw any exception
        aiChatService.clearCache();
        
        // Verify it completes successfully
        assertThat(true).isTrue();
    }
}
