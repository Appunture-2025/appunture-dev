/**
 * Serviço de Push Notifications usando Expo Notifications e Firebase Cloud Messaging.
 * Gerencia registro de tokens, permissões e handlers de notificações.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { createLogger } from "../utils/logger";
import { API_BASE_URL } from "../utils/constants";
import { getStoredToken } from "./storage";
import { firebaseAuth } from "./firebase";

const notificationLogger = createLogger("Notifications");

// Configuração do comportamento padrão de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Tipos para notificações
 */
export interface NotificationData {
  type?: "point" | "sync" | "reminder" | "update";
  pointId?: string;
  meridianId?: string;
  message?: string;
  [key: string]: string | undefined;
}

export interface NotificationSettings {
  hasToken: boolean;
  topics: string[];
}

/**
 * Serviço de notificações push
 */
class NotificationServiceClass {
  private pushToken: string | null = null;
  private isRegistered: boolean = false;

  /**
   * Verifica se o dispositivo suporta notificações push.
   */
  isDeviceSupported(): boolean {
    return Device.isDevice ?? false;
  }

  /**
   * Verifica se as permissões de notificação estão concedidas.
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.isDeviceSupported()) {
      notificationLogger.warn(
        "Push notifications não são suportadas em emuladores"
      );
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  /**
   * Solicita permissões de notificação ao usuário.
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isDeviceSupported()) {
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  /**
   * Obtém o Expo Push Token para o dispositivo.
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!this.isDeviceSupported()) {
      notificationLogger.warn(
        "Não é possível obter push token em dispositivo não físico"
      );
      return null;
    }

    try {
      // Verificar permissões
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        notificationLogger.warn("Permissão de notificação negada pelo usuário");
        return null;
      }

      // Obter project ID
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        notificationLogger.error("Project ID do Expo não encontrado");
        return null;
      }

      // Obter token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = tokenData.data;
      notificationLogger.info("Push token obtido:", this.pushToken);

      return this.pushToken;
    } catch (error) {
      notificationLogger.error("Falha ao obter push token:", error);
      return null;
    }
  }

  /**
   * Registra o token no servidor backend.
   */
  async registerTokenOnServer(token: string): Promise<boolean> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        notificationLogger.warn(
          "Usuário não autenticado - não é possível registrar token"
        );
        return false;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/register-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao registrar token");
      }

      this.isRegistered = true;
      notificationLogger.info("Token registrado no servidor com sucesso");
      return true;
    } catch (error) {
      notificationLogger.error("Falha ao registrar token no servidor:", error);
      return false;
    }
  }

  /**
   * Registra para receber push notifications.
   * Obtém o token e registra no servidor.
   */
  async registerForPushNotifications(): Promise<string | null> {
    const token = await this.getExpoPushToken();

    if (token) {
      const registered = await this.registerTokenOnServer(token);
      if (!registered) {
        notificationLogger.warn("Token obtido mas não registrado no servidor");
      }
    }

    return token;
  }

  /**
   * Remove o registro de notificações do servidor.
   */
  async unregisterPushNotifications(): Promise<boolean> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        return true; // Já está deslogado
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unregister-token`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao remover registro de token");
      }

      this.pushToken = null;
      this.isRegistered = false;
      notificationLogger.info("Registro de notificações removido");
      return true;
    } catch (error) {
      notificationLogger.error("Falha ao remover registro:", error);
      return false;
    }
  }

  /**
   * Inscreve o usuário em um tópico de notificações.
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/subscribe/${topic}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao inscrever no tópico");
      }

      notificationLogger.info("Inscrito no tópico:", topic);
      return true;
    } catch (error) {
      notificationLogger.error("Falha ao inscrever no tópico:", error);
      return false;
    }
  }

  /**
   * Remove inscrição de um tópico de notificações.
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        return true;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unsubscribe/${topic}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao remover inscrição do tópico");
      }

      notificationLogger.info("Desinscrito do tópico:", topic);
      return true;
    } catch (error) {
      notificationLogger.error("Falha ao desinscrever do tópico:", error);
      return false;
    }
  }

  /**
   * Obtém as configurações de notificação do usuário.
   */
  async getSettings(): Promise<NotificationSettings | null> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        return null;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/settings`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao obter configurações");
      }

      const data = await response.json();
      return {
        hasToken: data.hasToken,
        topics: data.topics || [],
      };
    } catch (error) {
      notificationLogger.error("Falha ao obter configurações:", error);
      return null;
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
   * Obtém a última resposta de notificação (se app foi aberto por notificação).
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return Notifications.getLastNotificationResponseAsync();
  }

  /**
   * Limpa o badge do app.
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Define o número do badge.
   */
  async setBadge(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Agenda uma notificação local.
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: NotificationData
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as Record<string, string>,
      },
      trigger,
    });
  }

  /**
   * Cancela todas as notificações agendadas.
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancela uma notificação agendada específica.
   */
  async cancelScheduledNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Lista todas as notificações agendadas.
   */
  async getAllScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Verifica se o token atual está registrado.
   */
  isTokenRegistered(): boolean {
    return this.isRegistered && this.pushToken !== null;
  }

  /**
   * Obtém o token atual (se disponível).
   */
  getCurrentToken(): string | null {
    return this.pushToken;
  }

  /**
   * Configura o canal de notificação para Android.
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Appunture",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366f1",
      });

      notificationLogger.info("Canal de notificação Android configurado");
    }
  }
}

// Exportar instância singleton
export const notificationService = new NotificationServiceClass();
