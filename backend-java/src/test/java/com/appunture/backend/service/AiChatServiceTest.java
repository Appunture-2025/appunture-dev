package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private FirestorePointService pointService;

    @Mock
    private FirestoreSymptomService symptomService;

    @InjectMocks
    private AiChatService aiChatService;

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

        // When
        String response = aiChatService.sendMessage("O que é acupuntura?");

        // Then
        assertThat(response).isNotNull();
        assertThat(response).contains("temporariamente indisponível");
    }

    @Test
    void sendMessage_ShouldBuildContextWithPointsAndSymptoms() {
        // Given - empty data
        when(pointService.findAll()).thenReturn(List.of());
        when(symptomService.findAll()).thenReturn(List.of());

        // When
        String response = aiChatService.sendMessage("Teste");

        // Then - should still return fallback
        assertThat(response).isNotNull();
        assertThat(response).contains("indisponível");
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

        // When
        String response = aiChatService.sendMessage("Consulta");

        // Then
        assertThat(response).isNotNull();
    }
}
