/**
 * Mock do serviço de notificações para testes.
 */

export const notificationService = {
  isDeviceSupported: jest.fn().mockReturnValue(true),
  checkPermissions: jest.fn().mockResolvedValue(true),
  requestPermissions: jest.fn().mockResolvedValue(true),
  getExpoPushToken: jest
    .fn()
    .mockResolvedValue("ExponentPushToken[mock-token]"),
  registerTokenOnServer: jest.fn().mockResolvedValue(true),
  registerForPushNotifications: jest
    .fn()
    .mockResolvedValue("ExponentPushToken[mock-token]"),
  unregisterPushNotifications: jest.fn().mockResolvedValue(true),
  subscribeToTopic: jest.fn().mockResolvedValue(true),
  unsubscribeFromTopic: jest.fn().mockResolvedValue(true),
  getSettings: jest.fn().mockResolvedValue({
    hasToken: true,
    topics: ["general", "updates"],
  }),
  addNotificationReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  getLastNotificationResponse: jest.fn().mockResolvedValue(null),
  clearBadge: jest.fn().mockResolvedValue(undefined),
  setBadge: jest.fn().mockResolvedValue(undefined),
  scheduleLocalNotification: jest.fn().mockResolvedValue("notification-id"),
  cancelAllScheduledNotifications: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotification: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotifications: jest.fn().mockResolvedValue([]),
  isTokenRegistered: jest.fn().mockReturnValue(true),
  getCurrentToken: jest.fn().mockReturnValue("ExponentPushToken[mock-token]"),
  setupAndroidChannel: jest.fn().mockResolvedValue(undefined),
};

export type NotificationData = {
  type?: "point" | "sync" | "reminder" | "update";
  pointId?: string;
  meridianId?: string;
  message?: string;
};

export type NotificationSettings = {
  hasToken: boolean;
  topics: string[];
};
