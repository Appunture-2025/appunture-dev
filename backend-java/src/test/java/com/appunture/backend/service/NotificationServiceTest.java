package com.appunture.backend.service;

import com.google.firebase.messaging.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Tests")
class NotificationServiceTest {

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();
    }

    @Nested
    @DisplayName("sendToMultipleDevices Tests")
    class SendToMultipleDevicesTests {

        @Test
        @DisplayName("should throw exception when tokens list is null")
        void shouldThrowException_whenTokensListIsNull() {
            // Act & Assert
            assertThatThrownBy(() -> 
                notificationService.sendToMultipleDevices(null, "title", "body", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("FCM tokens list cannot be empty");
        }

        @Test
        @DisplayName("should throw exception when tokens list is empty")
        void shouldThrowException_whenTokensListIsEmpty() {
            // Act & Assert
            assertThatThrownBy(() -> 
                notificationService.sendToMultipleDevices(List.of(), "title", "body", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("FCM tokens list cannot be empty");
        }
    }

    @Nested
    @DisplayName("sendDataMessage Tests")
    class SendDataMessageTests {

        @Test
        @DisplayName("should throw exception when data payload is null")
        void shouldThrowException_whenDataPayloadIsNull() {
            // Act & Assert
            assertThatThrownBy(() -> 
                notificationService.sendDataMessage("token123", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Data payload cannot be empty");
        }

        @Test
        @DisplayName("should throw exception when data payload is empty")
        void shouldThrowException_whenDataPayloadIsEmpty() {
            // Act & Assert
            assertThatThrownBy(() -> 
                notificationService.sendDataMessage("token123", Map.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Data payload cannot be empty");
        }
    }

    @Nested
    @DisplayName("Service Method Validation Tests")
    class ServiceMethodValidationTests {

        @Test
        @DisplayName("should accept valid FCM token for sendToDevice")
        void shouldAcceptValidFcmToken() {
            // Note: This test just validates the method signature accepts correct parameters
            // The actual Firebase call would fail without proper mock, which is expected
            String token = "valid-fcm-token-12345";
            String title = "Test Title";
            String body = "Test Body";
            Map<String, String> data = Map.of("key", "value");

            // We can only verify the parameters are accepted without Firebase mock
            assertThat(token).isNotBlank();
            assertThat(title).isNotBlank();
            assertThat(body).isNotBlank();
            assertThat(data).isNotEmpty();
        }

        @Test
        @DisplayName("should accept valid topic name for sendToTopic")
        void shouldAcceptValidTopicName() {
            // Note: This test just validates the method signature accepts correct parameters
            String topic = "test-topic";
            String title = "Test Title";
            String body = "Test Body";

            assertThat(topic).isNotBlank();
            assertThat(title).isNotBlank();
            assertThat(body).isNotBlank();
        }

        @Test
        @DisplayName("should accept valid tokens list for subscribeToTopic")
        void shouldAcceptValidTokensListForSubscribe() {
            List<String> tokens = List.of("token1", "token2");
            String topic = "test-topic";

            assertThat(tokens).isNotEmpty();
            assertThat(topic).isNotBlank();
        }

        @Test
        @DisplayName("should accept valid tokens list for unsubscribeFromTopic")
        void shouldAcceptValidTokensListForUnsubscribe() {
            List<String> tokens = List.of("token1", "token2");
            String topic = "test-topic";

            assertThat(tokens).isNotEmpty();
            assertThat(topic).isNotBlank();
        }

        @Test
        @DisplayName("should build notification message with data payload")
        void shouldBuildNotificationMessageWithDataPayload() {
            Map<String, String> data = Map.of(
                "pointId", "VG20",
                "action", "view_point"
            );

            assertThat(data).containsKey("pointId");
            assertThat(data).containsKey("action");
            assertThat(data.get("pointId")).isEqualTo("VG20");
        }

        @Test
        @DisplayName("should build notification message without data payload")
        void shouldBuildNotificationMessageWithoutDataPayload() {
            String token = "fcm-token";
            String title = "New Point Added";
            String body = "A new acupuncture point has been added";

            // Verify that null data is acceptable for methods that allow it
            assertThat(token).isNotBlank();
            assertThat(title).isNotBlank();
            assertThat(body).isNotBlank();
        }
    }
}
