import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PlantEvent } from './plantEventsService';

// Минимальная конфигурация
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) return false;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        return newStatus === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  static async scheduleEventNotification(
    event: PlantEvent,
    remindBeforeMinutes: number = 60
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const eventDate = new Date(event.date);
      const notificationTime = eventDate.getTime() - remindBeforeMinutes * 60 * 1000;

      if (notificationTime < Date.now()) return null;

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Напоминание',
          body: `${event.title} в ${eventDate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          data: { eventId: event.id, plantId: event.plantId },
          sound: true,
        },
        trigger: { 
          timestamp: notificationTime,
          type: 'timeInterval',
          repeats: false,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
}