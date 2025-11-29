/**
 * Hook para gerenciar push notifications no app.
 * Lida com registro de token, listeners de notificações e navegação.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import {
  notificationService,
  NotificationData,
  NotificationSettings,
} from "../services/notificationService";
import { useAuthStore } from "../stores/authStore";
import { createLogger } from "../utils/logger";

const hookLogger = createLogger("useNotifications");

export interface UseNotificationsReturn {
  /** Token de push notification (Expo Push Token) */
  pushToken: string | null;
  /** Última notificação recebida em foreground */
  lastNotification: Notifications.Notification | null;
  /** Configurações de notificação do usuário */
  settings: NotificationSettings | null;
  /** Se as permissões de notificação estão concedidas */
  hasPermission: boolean;
  /** Se está carregando */
  isLoading: boolean;
  /** Registra manualmente para notificações */
  register: () => Promise<void>;
  /** Remove registro de notificações */
  unregister: () => Promise<void>;
  /** Inscreve em um tópico */
  subscribeToTopic: (topic: string) => Promise<boolean>;
  /** Remove inscrição de um tópico */
  unsubscribeFromTopic: (topic: string) => Promise<boolean>;
  /** Limpa o badge do app */
  clearBadge: () => Promise<void>;
  /** Recarrega as configurações */
  refreshSettings: () => Promise<void>;
}

/**
 * Hook para gerenciar notificações push no app.
 * Automaticamente registra quando o usuário está autenticado.
 */
export function useNotifications(): UseNotificationsReturn {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  /**
   * Processa a resposta quando o usuário toca em uma notificação.
   */
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content
        .data as NotificationData;

      hookLogger.info("Notificação tocada:", data);

      // Navegar baseado no tipo de notificação
      if (data?.type === "point" && data.pointId) {
        router.push(`/points/${data.pointId}`);
      } else if (data?.type === "sync") {
        // Trigger sync na home
        router.push("/");
      } else if (data?.type === "reminder") {
        // Ir para estudos/lembretes
        router.push("/");
      }

      // Limpar badge
      notificationService.clearBadge();
    },
    [router]
  );

  /**
   * Registra para receber notificações.
   */
  const register = useCallback(async () => {
    setIsLoading(true);
    try {
      // Configurar canal Android
      await notificationService.setupAndroidChannel();

      // Obter e registrar token
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setPushToken(token);
        hookLogger.info("Registrado para notificações");
      }

      // Verificar permissões
      const permission = await notificationService.checkPermissions();
      setHasPermission(permission);

      // Carregar configurações
      const userSettings = await notificationService.getSettings();
      setSettings(userSettings);
    } catch (error) {
      hookLogger.error("Falha ao registrar para notificações:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove registro de notificações.
   */
  const unregister = useCallback(async () => {
    try {
      await notificationService.unregisterPushNotifications();
      setPushToken(null);
      setSettings(null);
      hookLogger.info("Registro de notificações removido");
    } catch (error) {
      hookLogger.error("Falha ao remover registro:", error);
    }
  }, []);

  /**
   * Inscreve em um tópico.
   */
  const subscribeToTopic = useCallback(async (topic: string) => {
    const success = await notificationService.subscribeToTopic(topic);
    if (success) {
      // Atualizar settings locais
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              topics: [...prev.topics, topic],
            }
          : null
      );
    }
    return success;
  }, []);

  /**
   * Remove inscrição de um tópico.
   */
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    const success = await notificationService.unsubscribeFromTopic(topic);
    if (success) {
      // Atualizar settings locais
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              topics: prev.topics.filter((t) => t !== topic),
            }
          : null
      );
    }
    return success;
  }, []);

  /**
   * Limpa o badge do app.
   */
  const clearBadge = useCallback(async () => {
    await notificationService.clearBadge();
  }, []);

  /**
   * Recarrega as configurações do servidor.
   */
  const refreshSettings = useCallback(async () => {
    const userSettings = await notificationService.getSettings();
    setSettings(userSettings);
  }, []);

  // Efeito para registrar quando o usuário está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Usuário não autenticado - limpar estado
      setPushToken(null);
      setSettings(null);
      setIsLoading(false);
      return;
    }

    // Registrar para push notifications
    register();

    // Listener para notificações em foreground
    notificationListener.current =
      notificationService.addNotificationReceivedListener((notification) => {
        hookLogger.info("Notificação recebida em foreground:", notification);
        setLastNotification(notification);
      });

    // Listener para quando usuário toca na notificação
    responseListener.current =
      notificationService.addNotificationResponseListener(
        handleNotificationResponse
      );

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
  }, [isAuthenticated, user, register, handleNotificationResponse]);

  // Limpar badge quando app é aberto
  useEffect(() => {
    clearBadge();
  }, [clearBadge]);

  return {
    pushToken,
    lastNotification,
    settings,
    hasPermission,
    isLoading,
    register,
    unregister,
    subscribeToTopic,
    unsubscribeFromTopic,
    clearBadge,
    refreshSettings,
  };
}
