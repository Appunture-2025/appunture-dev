package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.service.FirestoreUserService;
import com.appunture.backend.service.NotificationService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.TopicManagementResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("NotificationController Tests")
class NotificationControllerTest {

    @Autowired
    private NotificationController controller;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private FirestoreUserService userService;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private Firestore firestore;

    private static final String TEST_UID = "test-firebase-uid";
    private static final String TEST_FCM_TOKEN = "fcm-token-12345";
    private static final String TEST_TOPIC = "test-topic";

    private FirestoreUser testUser;

    @BeforeEach
    void setUp() {
        testUser = FirestoreUser.builder()
                .id("user-1")
                .firebaseUid(TEST_UID)
                .email("test@example.com")
                .fcmToken(TEST_FCM_TOKEN)
                .notificationTopics(List.of("topic1", "topic2"))
                .build();
    }

    @Nested
    @DisplayName("Register Token Tests")
    class RegisterTokenTests {

        @Test
        @DisplayName("should register token successfully when user exists")
        void shouldRegisterTokenSuccessfully_whenUserExists() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));
            doNothing().when(userService).updateFcmToken(eq(testUser.getId()), eq(TEST_FCM_TOKEN));

            NotificationController.RegisterTokenRequest request = 
                new NotificationController.RegisterTokenRequest(TEST_FCM_TOKEN);

            // Act
            ResponseEntity<Map<String, Object>> response = controller.registerToken(TEST_UID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
            verify(userService).updateFcmToken(testUser.getId(), TEST_FCM_TOKEN);
        }

        @Test
        @DisplayName("should return bad request when token is null")
        void shouldReturnBadRequest_whenTokenIsNull() {
            // Arrange
            NotificationController.RegisterTokenRequest request = 
                new NotificationController.RegisterTokenRequest(null);

            // Act
            ResponseEntity<Map<String, Object>> response = controller.registerToken(TEST_UID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
            assertThat(response.getBody()).containsKey("error");
        }

        @Test
        @DisplayName("should return bad request when token is blank")
        void shouldReturnBadRequest_whenTokenIsBlank() {
            // Arrange
            NotificationController.RegisterTokenRequest request = 
                new NotificationController.RegisterTokenRequest("   ");

            // Act
            ResponseEntity<Map<String, Object>> response = controller.registerToken(TEST_UID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
        }

        @Test
        @DisplayName("should return bad request when user not found")
        void shouldReturnBadRequest_whenUserNotFound() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.empty());
            NotificationController.RegisterTokenRequest request = 
                new NotificationController.RegisterTokenRequest(TEST_FCM_TOKEN);

            // Act
            ResponseEntity<Map<String, Object>> response = controller.registerToken(TEST_UID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
            assertThat(response.getBody().get("error").toString()).contains("User not found");
        }
    }

    @Nested
    @DisplayName("Unregister Token Tests")
    class UnregisterTokenTests {

        @Test
        @DisplayName("should unregister token successfully when user exists")
        void shouldUnregisterTokenSuccessfully_whenUserExists() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));
            doNothing().when(userService).removeFcmToken(testUser.getId());

            // Act
            ResponseEntity<Map<String, Object>> response = controller.unregisterToken(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
            verify(userService).removeFcmToken(testUser.getId());
        }

        @Test
        @DisplayName("should return success when user does not exist")
        void shouldReturnSuccess_whenUserDoesNotExist() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.empty());

            // Act
            ResponseEntity<Map<String, Object>> response = controller.unregisterToken(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
            verify(userService, never()).removeFcmToken(any());
        }
    }

    @Nested
    @DisplayName("Subscribe to Topic Tests")
    class SubscribeToTopicTests {

        @Test
        @DisplayName("should subscribe to topic successfully")
        void shouldSubscribeToTopicSuccessfully() throws FirebaseMessagingException {
            // Arrange
            TopicManagementResponse mockResponse = mock(TopicManagementResponse.class);
            when(mockResponse.getSuccessCount()).thenReturn(1);
            when(mockResponse.getFailureCount()).thenReturn(0);

            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));
            when(notificationService.subscribeToTopic(any(), eq(TEST_TOPIC))).thenReturn(mockResponse);
            doNothing().when(userService).addNotificationTopic(eq(testUser.getId()), eq(TEST_TOPIC));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.subscribeToTopic(TEST_UID, TEST_TOPIC);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
            assertThat(response.getBody()).containsEntry("topic", TEST_TOPIC);
            verify(notificationService).subscribeToTopic(List.of(TEST_FCM_TOKEN), TEST_TOPIC);
        }

        @Test
        @DisplayName("should return bad request when user not found")
        void shouldReturnBadRequest_whenUserNotFoundForSubscribe() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.empty());

            // Act
            ResponseEntity<Map<String, Object>> response = controller.subscribeToTopic(TEST_UID, TEST_TOPIC);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
        }

        @Test
        @DisplayName("should return bad request when no FCM token registered")
        void shouldReturnBadRequest_whenNoFcmTokenRegistered() {
            // Arrange
            FirestoreUser userWithoutToken = FirestoreUser.builder()
                    .id("user-1")
                    .firebaseUid(TEST_UID)
                    .fcmToken(null)
                    .build();
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(userWithoutToken));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.subscribeToTopic(TEST_UID, TEST_TOPIC);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
            assertThat(response.getBody().get("error").toString()).contains("No FCM token");
        }

        @Test
        @DisplayName("should sanitize topic name with special characters")
        void shouldSanitizeTopicName() throws FirebaseMessagingException {
            // Arrange
            String unsafeTopic = "test<script>alert</script>";
            String sanitizedTopic = "testscriptalertscript";

            TopicManagementResponse mockResponse = mock(TopicManagementResponse.class);
            when(mockResponse.getSuccessCount()).thenReturn(1);

            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));
            when(notificationService.subscribeToTopic(any(), eq(sanitizedTopic))).thenReturn(mockResponse);

            // Act
            ResponseEntity<Map<String, Object>> response = controller.subscribeToTopic(TEST_UID, unsafeTopic);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("topic", sanitizedTopic);
        }
    }

    @Nested
    @DisplayName("Unsubscribe from Topic Tests")
    class UnsubscribeFromTopicTests {

        @Test
        @DisplayName("should unsubscribe from topic successfully")
        void shouldUnsubscribeFromTopicSuccessfully() throws FirebaseMessagingException {
            // Arrange
            TopicManagementResponse mockResponse = mock(TopicManagementResponse.class);
            when(mockResponse.getSuccessCount()).thenReturn(1);

            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));
            when(notificationService.unsubscribeFromTopic(any(), eq(TEST_TOPIC))).thenReturn(mockResponse);
            doNothing().when(userService).removeNotificationTopic(eq(testUser.getId()), eq(TEST_TOPIC));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.unsubscribeFromTopic(TEST_UID, TEST_TOPIC);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
        }

        @Test
        @DisplayName("should return success when user not found for unsubscribe")
        void shouldReturnSuccess_whenUserNotFoundForUnsubscribe() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.empty());

            // Act
            ResponseEntity<Map<String, Object>> response = controller.unsubscribeFromTopic(TEST_UID, TEST_TOPIC);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
        }
    }

    @Nested
    @DisplayName("Get Settings Tests")
    class GetSettingsTests {

        @Test
        @DisplayName("should return settings successfully when user exists")
        void shouldReturnSettingsSuccessfully_whenUserExists() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(testUser));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.getSettings(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("success", true);
            assertThat(response.getBody()).containsEntry("hasToken", true);
            assertThat(response.getBody().get("topics")).isEqualTo(List.of("topic1", "topic2"));
        }

        @Test
        @DisplayName("should return hasToken false when no FCM token")
        void shouldReturnHasTokenFalse_whenNoFcmToken() {
            // Arrange
            FirestoreUser userWithoutToken = FirestoreUser.builder()
                    .id("user-1")
                    .firebaseUid(TEST_UID)
                    .fcmToken(null)
                    .notificationTopics(List.of())
                    .build();
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(userWithoutToken));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.getSettings(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).containsEntry("hasToken", false);
        }

        @Test
        @DisplayName("should return bad request when user not found for settings")
        void shouldReturnBadRequest_whenUserNotFoundForSettings() {
            // Arrange
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.empty());

            // Act
            ResponseEntity<Map<String, Object>> response = controller.getSettings(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).containsEntry("success", false);
        }

        @Test
        @DisplayName("should return empty topics list when notificationTopics is null")
        void shouldReturnEmptyTopics_whenTopicsIsNull() {
            // Arrange
            FirestoreUser userWithNullTopics = FirestoreUser.builder()
                    .id("user-1")
                    .firebaseUid(TEST_UID)
                    .fcmToken(TEST_FCM_TOKEN)
                    .notificationTopics(null)
                    .build();
            when(userService.findByFirebaseUid(TEST_UID)).thenReturn(Optional.of(userWithNullTopics));

            // Act
            ResponseEntity<Map<String, Object>> response = controller.getSettings(TEST_UID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("topics")).isEqualTo(List.of());
        }
    }
}
