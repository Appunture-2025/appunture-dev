package com.appunture.backend.controller;

import com.appunture.backend.service.FirestoreUserService;
import com.appunture.backend.service.NotificationService;
import com.google.firebase.messaging.FirebaseMessagingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Push notification management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final FirestoreUserService userService;

    @PostMapping("/register-token")
    @Operation(summary = "Register FCM token", description = "Register a device FCM token for push notifications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid token"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> registerToken(
            @AuthenticationPrincipal String firebaseUid,
            @RequestBody RegisterTokenRequest request) {

        if (request.token() == null || request.token().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "FCM token is required"
            ));
        }

        try {
            var user = userService.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            userService.updateFcmToken(user.get().getId(), request.token());
            log.info("FCM token registered for user: {}", firebaseUid);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "FCM token registered successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to register FCM token", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to register token: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/unregister-token")
    @Operation(summary = "Unregister FCM token", description = "Remove the FCM token for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token unregistered successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> unregisterToken(
            @AuthenticationPrincipal String firebaseUid) {

        try {
            var user = userService.findByFirebaseUid(firebaseUid);
            if (user.isPresent()) {
                userService.removeFcmToken(user.get().getId());
                log.info("FCM token unregistered for user: {}", firebaseUid);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "FCM token unregistered"
            ));
        } catch (Exception e) {
            log.error("Failed to unregister FCM token", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to unregister token"
            ));
        }
    }

    @PostMapping("/subscribe/{topic}")
    @Operation(summary = "Subscribe to topic", description = "Subscribe the current user to a notification topic")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Subscribed successfully"),
        @ApiResponse(responseCode = "400", description = "No FCM token registered"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> subscribeToTopic(
            @AuthenticationPrincipal String firebaseUid,
            @PathVariable String topic) {

        try {
            var user = userService.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            String fcmToken = user.get().getFcmToken();
            if (fcmToken == null || fcmToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No FCM token registered. Please register a token first."
                ));
            }

            // Validate topic name
            String sanitizedTopic = sanitizeTopic(topic);
            
            notificationService.subscribeToTopic(List.of(fcmToken), sanitizedTopic);
            userService.addNotificationTopic(user.get().getId(), sanitizedTopic);
            
            log.info("User {} subscribed to topic: {}", firebaseUid, sanitizedTopic);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "topic", sanitizedTopic,
                "message", "Subscribed to topic successfully"
            ));
        } catch (FirebaseMessagingException e) {
            log.error("Failed to subscribe to topic", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to subscribe to topic: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/unsubscribe/{topic}")
    @Operation(summary = "Unsubscribe from topic", description = "Unsubscribe the current user from a notification topic")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unsubscribed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> unsubscribeFromTopic(
            @AuthenticationPrincipal String firebaseUid,
            @PathVariable String topic) {

        try {
            var user = userService.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return ResponseEntity.ok(Map.of("success", true));
            }

            String fcmToken = user.get().getFcmToken();
            String sanitizedTopic = sanitizeTopic(topic);
            
            if (fcmToken != null && !fcmToken.isBlank()) {
                notificationService.unsubscribeFromTopic(List.of(fcmToken), sanitizedTopic);
            }
            
            userService.removeNotificationTopic(user.get().getId(), sanitizedTopic);
            log.info("User {} unsubscribed from topic: {}", firebaseUid, sanitizedTopic);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "topic", sanitizedTopic,
                "message", "Unsubscribed from topic successfully"
            ));
        } catch (FirebaseMessagingException e) {
            log.error("Failed to unsubscribe from topic", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to unsubscribe from topic"
            ));
        }
    }

    @GetMapping("/settings")
    @Operation(summary = "Get notification settings", description = "Get the current user's notification settings and subscribed topics")
    public ResponseEntity<Map<String, Object>> getSettings(
            @AuthenticationPrincipal String firebaseUid) {

        try {
            var user = userService.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            var userData = user.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "hasToken", userData.getFcmToken() != null && !userData.getFcmToken().isBlank(),
                "topics", userData.getNotificationTopics() != null ? userData.getNotificationTopics() : List.of()
            ));
        } catch (Exception e) {
            log.error("Failed to get notification settings", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to get settings"
            ));
        }
    }

    private String sanitizeTopic(String topic) {
        return topic.replaceAll("[^a-zA-Z0-9_-]", "");
    }

    public record RegisterTokenRequest(String token) {}
}
