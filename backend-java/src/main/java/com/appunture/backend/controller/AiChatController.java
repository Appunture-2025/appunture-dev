package com.appunture.backend.controller;

import com.appunture.backend.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final AiChatService aiChatService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("[CHAT] GET /chat/test endpoint called");
        return ResponseEntity.ok("Test endpoint working!");
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> payload) {
        log.info("[CHAT] POST /chat request received");
        log.info("[CHAT] Payload keys: {}", payload.keySet());
        log.info("[CHAT] Payload values lengths: {}", payload.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                    Map.Entry::getKey,
                    e -> e.getValue() != null ? e.getValue().length() : 0
                )));

        String question = payload.get("message");
        log.info("[CHAT] Extracted question: {}", question != null ? question.substring(0, Math.min(100, question.length())) + "..." : "null");

        if (question == null || question.trim().isEmpty()) {
            log.warn("[CHAT] Empty message received - returning 400");
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        log.info("[CHAT] Question length: {} chars", question.length());
        log.info("[CHAT] AiChatService instance: {}", aiChatService != null ? "OK" : "NULL");

        try {
            log.info("[CHAT] Calling aiChatService.sendMessage()");
            String answer = aiChatService.sendMessage(question);
            log.info("[CHAT] Answer generated successfully");
            log.info("[CHAT] Answer length: {} chars", answer.length());
            log.info("[CHAT] Answer preview: {}", answer.substring(0, Math.min(100, answer.length())) + "...");

            Map<String, String> responseBody = Map.of("response", answer);
            log.info("[CHAT] Returning 200 OK with response");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("[CHAT] Exception in ask() method");
            log.error("[CHAT] Exception type: {}", e.getClass().getSimpleName());
            log.error("[CHAT] Exception message: {}", e.getMessage());
            log.error("[CHAT] Exception stack trace:", e);
            throw e;
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.info("[CHAT] Health check requested");
        try {
            Map<String, String> status = aiChatService.getHealthStatus();
            log.info("[CHAT] Health status: {}", status);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("[CHAT] Error getting health status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
}
