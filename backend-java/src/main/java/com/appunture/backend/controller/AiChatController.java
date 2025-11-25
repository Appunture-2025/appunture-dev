package com.appunture.backend.controller;

import com.appunture.backend.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> payload) {
        String question = payload.get("message");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }
        
        String answer = aiChatService.sendMessage(question);
        return ResponseEntity.ok(Map.of("response", answer));
    }
}
