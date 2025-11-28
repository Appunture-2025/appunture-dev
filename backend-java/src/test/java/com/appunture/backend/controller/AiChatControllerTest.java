package com.appunture.backend.controller;

import com.appunture.backend.service.AiChatService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class AiChatControllerTest {

    @Autowired
    private AiChatController controller;

    @MockBean
    private AiChatService aiChatService;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private Firestore firestore;

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

    @Test
    void ask_ShouldReturnBadRequestWhenMessageIsEmpty() {
        // Given
        Map<String, String> payload = Map.of("message", "   ");

        // When
        ResponseEntity<Map<String, String>> response = controller.ask(payload);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
