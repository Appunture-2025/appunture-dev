# Prompt – Implementar FCM Push Notifications

## Contexto

- Backend Java com Firebase Admin SDK já configurado
- Frontend React Native + Expo
- FCM (Firebase Cloud Messaging) para push notifications
- Casos de uso: lembretes, sync completo, updates

## Objetivo

Implementar push notifications end-to-end (backend + frontend).

## Implementação Backend

### 1. Adicionar Dependência (já deve existir)

Verificar se `firebase-admin` está no `pom.xml`:

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

### 2. Criar NotificationService

`backend-java/src/main/java/com/appunture/service/NotificationService.java`:

```java
package com.appunture.service;

import com.google.firebase.messaging.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Envia notificação para um único dispositivo.
     */
    public String sendToDevice(String fcmToken, String title, String body, Map<String, String> data)
            throws FirebaseMessagingException {

        Message message = Message.builder()
            .setToken(fcmToken)
            .setNotification(Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build())
            .putAllData(data != null ? data : Map.of())
            .setAndroidConfig(AndroidConfig.builder()
                .setPriority(AndroidConfig.Priority.HIGH)
                .setNotification(AndroidNotification.builder()
                    .setIcon("ic_notification")
                    .setColor("#6366f1")
                    .build())
                .build())
            .setApnsConfig(ApnsConfig.builder()
                .setAps(Aps.builder()
                    .setBadge(1)
                    .setSound("default")
                    .build())
                .build())
            .build();

        String response = FirebaseMessaging.getInstance().send(message);
        logger.info("Notification sent successfully: {}", response);
        return response;
    }

    /**
     * Envia notificação para múltiplos dispositivos.
     */
    public BatchResponse sendToMultipleDevices(List<String> fcmTokens, String title, String body,
            Map<String, String> data) throws FirebaseMessagingException {

        MulticastMessage message = MulticastMessage.builder()
            .addAllTokens(fcmTokens)
            .setNotification(Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build())
            .putAllData(data != null ? data : Map.of())
            .build();

        BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
        logger.info("Notifications sent: {} success, {} failure",
            response.getSuccessCount(), response.getFailureCount());

        return response;
    }

    /**
     * Envia notificação para um tópico.
     */
    public String sendToTopic(String topic, String title, String body, Map<String, String> data)
            throws FirebaseMessagingException {

        Message message = Message.builder()
            .setTopic(topic)
            .setNotification(Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build())
            .putAllData(data != null ? data : Map.of())
            .build();

        return FirebaseMessaging.getInstance().send(message);
    }

    /**
     * Inscreve tokens em um tópico.
     */
    public TopicManagementResponse subscribeToTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        return FirebaseMessaging.getInstance().subscribeToTopic(tokens, topic);
    }

    /**
     * Remove tokens de um tópico.
     */
    public TopicManagementResponse unsubscribeFromTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        return FirebaseMessaging.getInstance().unsubscribeFromTopic(tokens, topic);
    }
}
```

### 3. Criar NotificationController

`backend-java/src/main/java/com/appunture/controller/NotificationController.java`:

```java
package com.appunture.controller;

import com.appunture.service.NotificationService;
import com.google.firebase.messaging.FirebaseMessagingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Push notification management")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @PostMapping("/register-token")
    @Operation(summary = "Register FCM token for current user")
    public ResponseEntity<?> registerToken(
            @AuthenticationPrincipal String userId,
            @RequestBody RegisterTokenRequest request) {

        userService.updateFcmToken(userId, request.token());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/unregister-token")
    @Operation(summary = "Unregister FCM token")
    public ResponseEntity<?> unregisterToken(@AuthenticationPrincipal String userId) {
        userService.removeFcmToken(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/subscribe/{topic}")
    @Operation(summary = "Subscribe to a notification topic")
    public ResponseEntity<?> subscribeToTopic(
            @AuthenticationPrincipal String userId,
            @PathVariable String topic) throws FirebaseMessagingException {

        String fcmToken = userService.getFcmToken(userId);
        if (fcmToken == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No FCM token registered"));
        }

        notificationService.subscribeToTopic(List.of(fcmToken), topic);
        return ResponseEntity.ok(Map.of("success", true, "topic", topic));
    }

    @DeleteMapping("/unsubscribe/{topic}")
    @Operation(summary = "Unsubscribe from a notification topic")
    public ResponseEntity<?> unsubscribeFromTopic(
            @AuthenticationPrincipal String userId,
            @PathVariable String topic) throws FirebaseMessagingException {

        String fcmToken = userService.getFcmToken(userId);
        if (fcmToken != null) {
            notificationService.unsubscribeFromTopic(List.of(fcmToken), topic);
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    public record RegisterTokenRequest(String token) {}
}
```

### 4. Atualizar User Entity

Adicionar campo `fcmToken` no modelo User:

```java
@Data
public class User {
    private String id;
    private String email;
    private String displayName;
    private String photoUrl;
    private String fcmToken;  // ADICIONAR
    private List<String> notificationTopics;  // ADICIONAR
    // ...
}
```

## Implementação Frontend

### 1. Instalar Dependências

```bash
cd frontend-mobile/appunture
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#6366f1",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 3. Criar NotificationService

`frontend-mobile/appunture/services/notificationService.ts`:

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiService } from "./apiService";
import { logger } from "../utils/logger";

// Configurar comportamento de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Registra para receber push notifications.
   * Retorna o Expo Push Token ou null se falhar.
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      logger.warn("Push notifications require a physical device");
      return null;
    }

    // Verificar/solicitar permissões
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.warn("Push notification permission denied");
      return null;
    }

    // Obter token
    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      this.expoPushToken = tokenData.data;

      // Registrar no backend
      await this.registerTokenOnServer(this.expoPushToken);

      logger.info("Push token registered:", this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      logger.error("Failed to get push token:", error);
      return null;
    }
  }

  /**
   * Registra o token FCM no servidor.
   */
  private async registerTokenOnServer(token: string): Promise<void> {
    try {
      await apiService.post("/notifications/register-token", { token });
    } catch (error) {
      logger.error("Failed to register token on server:", error);
      throw error;
    }
  }

  /**
   * Remove registro de notificações.
   */
  async unregisterPushNotifications(): Promise<void> {
    try {
      await apiService.delete("/notifications/unregister-token");
      this.expoPushToken = null;
    } catch (error) {
      logger.error("Failed to unregister token:", error);
    }
  }

  /**
   * Inscreve em um tópico de notificações.
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await apiService.post(`/notifications/subscribe/${topic}`);
      logger.info("Subscribed to topic:", topic);
    } catch (error) {
      logger.error("Failed to subscribe to topic:", error);
      throw error;
    }
  }

  /**
   * Remove inscrição de um tópico.
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/unsubscribe/${topic}`);
      logger.info("Unsubscribed from topic:", topic);
    } catch (error) {
      logger.error("Failed to unsubscribe from topic:", error);
    }
  }

  /**
   * Adiciona listener para notificações recebidas (app em foreground).
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Adiciona listener para quando usuário toca na notificação.
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Obtém notificação que abriu o app (se houver).
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return Notifications.getLastNotificationResponseAsync();
  }

  /**
   * Limpa badge do app.
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Agenda notificação local.
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger,
    });
  }

  /**
   * Cancela todas as notificações agendadas.
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
```

### 4. Criar Hook useNotifications

`frontend-mobile/appunture/hooks/useNotifications.ts`:

```typescript
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../stores/authStore";
import { logger } from "../utils/logger";

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Só registra se usuário estiver logado
    if (!user) return;

    // Registrar para push notifications
    notificationService
      .registerForPushNotifications()
      .then((token) => setExpoPushToken(token));

    // Listener para notificações em foreground
    notificationListener.current =
      notificationService.addNotificationReceivedListener((notification) => {
        logger.info("Notification received in foreground:", notification);
        setNotification(notification);
      });

    // Listener para quando usuário toca na notificação
    responseListener.current =
      notificationService.addNotificationResponseListener((response) => {
        logger.info("Notification response:", response);
        handleNotificationResponse(response);
      });

    // Verificar se app foi aberto por notificação
    notificationService.getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    const data = response.notification.request.content.data;

    // Navegar baseado no tipo de notificação
    if (data?.type === "point") {
      router.push(`/points/${data.pointId}`);
    } else if (data?.type === "sync") {
      // Trigger sync
      router.push("/");
    }
  };

  return {
    expoPushToken,
    notification,
  };
}
```

### 5. Integrar no App Root

`frontend-mobile/appunture/app/_layout.tsx`:

```typescript
import { useNotifications } from "../hooks/useNotifications";

export default function RootLayout() {
  // Adicionar hook
  useNotifications();

  // ... resto do layout
}
```

## Testes

### Backend Test

```java
@SpringBootTest
class NotificationServiceTest {

    @MockBean
    private FirebaseMessaging firebaseMessaging;

    @Autowired
    private NotificationService notificationService;

    @Test
    void shouldSendNotificationToDevice() throws Exception {
        when(FirebaseMessaging.getInstance()).thenReturn(firebaseMessaging);
        when(firebaseMessaging.send(any())).thenReturn("message-id");

        String result = notificationService.sendToDevice(
            "test-token",
            "Test Title",
            "Test Body",
            Map.of("key", "value")
        );

        assertNotNull(result);
    }
}
```

### Frontend Test

```typescript
// __tests__/services/notificationService.test.ts
import { notificationService } from "../../services/notificationService";
import * as Notifications from "expo-notifications";

jest.mock("expo-notifications");
jest.mock("expo-device", () => ({ isDevice: true }));

describe("NotificationService", () => {
  it("should register for push notifications", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: "ExponentPushToken[xxx]",
    });

    const token = await notificationService.registerForPushNotifications();

    expect(token).toBe("ExponentPushToken[xxx]");
  });
});
```

## Critérios de Aceitação

- [ ] Backend: NotificationService criado e funcionando
- [ ] Backend: Endpoints de registro de token implementados
- [ ] Frontend: expo-notifications configurado
- [ ] Frontend: Hook useNotifications funcionando
- [ ] Frontend: Notificações aparecem em foreground
- [ ] Frontend: Tap em notificação navega corretamente
- [ ] Tokens FCM salvos no perfil do usuário
- [ ] Testes cobrindo casos principais

## Verificação

```bash
# Backend - testar endpoint
curl -X POST http://localhost:8080/api/notifications/register-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "ExponentPushToken[xxx]"}'

# Frontend - verificar no console
# Deve aparecer: "Push token registered: ExponentPushToken[xxx]"
```
