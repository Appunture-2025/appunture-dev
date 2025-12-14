package com.appunture.backend.service;

import com.appunture.backend.config.AiConfiguration;
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
        AiConfiguration aiConfig = new AiConfiguration();
        aiConfig.setEnabled(false);
        aiChatService = new AiChatService(pointService, symptomService, aiConfig);
    }

    @Test
    void sendMessage_ShouldReturnErrorMessageWhenAiNotConfigured() {
        String response = aiChatService.sendMessage("O que é acupuntura?");
        
        assertThat(response).isNotNull();
        assertThat(response).isEqualTo("Erro: Serviço de IA não inicializado.");
    }
}
