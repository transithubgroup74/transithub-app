import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppNotification = {
  id: string;
  icon: string;
  bg: string;
  title: string;
  msg: string;
  time: string;
  createdAt: string;
  read: boolean;
};

const KEY = 'userNotifications';

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  try {
    const existing = await getNotifications();
    const newNotif: AppNotification = {
      ...n,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify([newNotif, ...existing]));
  } catch {}
}

export async function markAllRead() {
  try {
    const existing = await getNotifications();
    const updated = existing.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function getUnreadCount(): Promise<number> {
  const notifs = await getNotifications();
  return notifs.filter((n) => !n.read).length;
}

export function formatTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
