import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTripReminders(
  from: string,
  to: string,
  departsAt: Date,
  seat: string | number
): Promise<void> {
  const granted = await requestPushPermission();
  if (!granted) return;

  // Cancel any existing reminders for same trip (best-effort)
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  // Reminder the day before at 8am
  const dayBefore = new Date(departsAt);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(8, 0, 0, 0);
  if (dayBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚌 Trip Tomorrow!',
        body: `${from} → ${to} departs tomorrow. Seat ${seat}. Don't be late!`,
        data: { type: 'trip_reminder' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dayBefore },
    });
  }

  // Reminder 2 hours before departure
  const twoHoursBefore = new Date(departsAt.getTime() - 2 * 60 * 60 * 1000);
  if (twoHoursBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Departing Soon',
        body: `Your ${from} → ${to} bus departs in 2 hours. Seat ${seat}. Head to the station now!`,
        data: { type: 'trip_soon' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: twoHoursBefore },
    });
  }
}

export async function sendInstantNotification(title: string, body: string): Promise<void> {
  const granted = await requestPushPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
