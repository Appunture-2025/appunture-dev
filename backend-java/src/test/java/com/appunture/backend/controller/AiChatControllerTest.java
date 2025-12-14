package com.appunture.backend.controller;

import com.appunture.backend.service.AiChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatControllerTest {

    @Mock
    private AiChatService aiChatService;

    @InjectMocks
    private AiChatController controller;

    @Test
    void ask_ShouldReturnResponse() {
        // Given
        when(aiChatService.sendMessage(anyString())).thenReturn("Resposta do assistente");
        Map<String, String> payload = Map.of("message", "O que é acupuntura?");

        // When
        ResponseEntity<Map<String, String>> response = controller.ask(payload);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("response", "Resposta do assistente");
    }

    @Test
    void ask_ShouldReturnBadRequestWhenMessageIsNull() {
        // Given
        Map<String, String> payload = Map.of();

        // When
        ResponseEntity<Map<String, String>> response = controller.ask(payload);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsKey("error");
    }
}
