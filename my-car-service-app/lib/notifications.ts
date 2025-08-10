import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Extra fields required by newer SDKs
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Service Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [250, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return granted ?? false;
}

export async function scheduleReminder(dateIso: string, body: string): Promise<string | undefined> {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return undefined;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Car Service Reminder',
      body,
      sound: true,
    },
    trigger: Platform.select({
      android: { date, channelId: 'reminders' } as Notifications.DateTriggerInput,
      ios: { date } as Notifications.DateTriggerInput,
      default: { date } as Notifications.DateTriggerInput,
    })!,
  });
  return id;
}

export async function cancelReminder(notificationId?: string): Promise<void> {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {}
  }
}