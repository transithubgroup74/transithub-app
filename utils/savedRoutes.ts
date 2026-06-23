import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'savedRoutes';

export type SavedRoute = {
  from: string;
  to: string;
  savedAt: string;
};

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function saveRoute(from: string, to: string): Promise<void> {
  try {
    const existing = await getSavedRoutes();
    if (existing.some((r) => r.from === from && r.to === to)) return;
    const updated = [{ from, to, savedAt: new Date().toISOString() }, ...existing];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (_) {}
}

export async function removeRoute(from: string, to: string): Promise<void> {
  try {
    const existing = await getSavedRoutes();
    const updated = existing.filter((r) => !(r.from === from && r.to === to));
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (_) {}
}

export async function isRouteSaved(from: string, to: string): Promise<boolean> {
  const existing = await getSavedRoutes();
  return existing.some((r) => r.from === from && r.to === to);
}
