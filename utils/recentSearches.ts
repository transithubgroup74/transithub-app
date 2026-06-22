import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'recentSearches';
const MAX = 5;

export type RecentSearch = {
  from: string;
  to: string;
  date: string;
  time: string;
};

export async function saveSearch(from: string, to: string, date: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const existing: RecentSearch[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((s) => !(s.from === from && s.to === to));
    const entry: RecentSearch = {
      from,
      to,
      date,
      time: new Date().toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    const updated = [entry, ...filtered].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (_) {}
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
