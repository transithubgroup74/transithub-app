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
const API = 'https://transithub-backend-production.up.railway.app/api';

// Icon + tint per alert type sent from the admin dashboard.
function alertStyle(type?: string): { icon: string; bg: string } {
  const t = String(type || '');
  if (t.includes('Delay')) return { icon: '⚠️', bg: 'rgba(255,159,67,0.15)' };
  if (t.includes('Cancellation')) return { icon: '❌', bg: 'rgba(255,71,87,0.15)' };
  if (t.includes('Reminder')) return { icon: '✅', bg: 'rgba(0,201,167,0.15)' };
  if (t.includes('Promotion')) return { icon: '🎉', bg: 'rgba(155,89,182,0.15)' };
  return { icon: '📢', bg: 'rgba(201,168,76,0.15)' };
}

// Pulls broadcast alerts sent from the admin dashboard and merges any new
// ones into the local notification list (deduped by server id).
export async function syncServerAlerts(): Promise<void> {
  try {
    const res = await fetch(API + '/alerts');
    if (!res.ok) return;
    const alerts = await res.json();
    if (!Array.isArray(alerts) || !alerts.length) return;
    const existing = await getNotifications();
    const have = new Set(existing.map((n) => n.id));
    const fresh: AppNotification[] = alerts
      .filter((a: any) => a && a.id && !have.has('srv-' + a.id))
      .map((a: any) => ({
        id: 'srv-' + a.id,
        ...alertStyle(a.type),
        title: a.title || 'TransitHub',
        msg: a.message || '',
        time: '',
        createdAt: a.createdAt || new Date().toISOString(),
        read: false,
      }));
    if (!fresh.length) return;
    const merged = [...fresh, ...existing].sort(
      (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
    );
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  } catch {}
}

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
