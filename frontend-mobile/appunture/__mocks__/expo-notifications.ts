/**
 * Mock do módulo expo-notifications para testes.
 */

const mockSubscription = {
  remove: jest.fn(),
};

export const setNotificationHandler = jest.fn();

export const getPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ status: "granted" });

export const requestPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ status: "granted" });

export const getExpoPushTokenAsync = jest.fn().mockResolvedValue({
  data: "ExponentPushToken[mock-token]",
});

export const addNotificationReceivedListener = jest
  .fn()
  .mockReturnValue(mockSubscription);

export const addNotificationResponseReceivedListener = jest
  .fn()
  .mockReturnValue(mockSubscription);

export const removeNotificationSubscription = jest.fn();

export const getLastNotificationResponseAsync = jest
  .fn()
  .mockResolvedValue(null);

export const setBadgeCountAsync = jest.fn().mockResolvedValue(true);

export const scheduleNotificationAsync = jest
  .fn()
  .mockResolvedValue("notification-id");

export const cancelAllScheduledNotificationsAsync = jest
  .fn()
  .mockResolvedValue(undefined);

export const cancelScheduledNotificationAsync = jest
  .fn()
  .mockResolvedValue(undefined);

export const getAllScheduledNotificationsAsync = jest
  .fn()
  .mockResolvedValue([]);

export const setNotificationChannelAsync = jest
  .fn()
  .mockResolvedValue(undefined);

export const AndroidImportance = {
  MAX: 5,
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
  MIN: 1,
};

// Types
export type Notification = {
  date: number;
  request: {
    identifier: string;
    content: {
      title: string | null;
      body: string | null;
      data: Record<string, any>;
    };
  };
};

export type NotificationResponse = {
  notification: Notification;
  actionIdentifier: string;
};

export type Subscription = typeof mockSubscription;

export type NotificationTriggerInput = {
  seconds?: number;
  date?: Date;
  repeats?: boolean;
};

export type NotificationRequest = {
  identifier: string;
  content: {
    title: string | null;
    body: string | null;
    data: Record<string, any>;
  };
  trigger: NotificationTriggerInput | null;
};
