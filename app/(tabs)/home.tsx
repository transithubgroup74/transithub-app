import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUnreadCount } from '../../utils/notifications';
import { getRecentSearches, clearRecentSearches, RecentSearch } from '../../utils/recentSearches';
import { getSavedRoutes, saveRoute, removeRoute, SavedRoute } from '../../utils/savedRoutes';

const POPULAR = [
  { from: 'Kumasi', to: 'Accra', price: 80 },
  { from: 'Accra', to: 'Tamale', price: 120 },
  { from: 'Accra', to: 'Bolgatanga', price: 140 },
  { from: 'Accra', to: 'Cape Coast', price: 50 },
];

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [from, setFrom] = useState('Kumasi');
  const [to, setTo] = useState('Accra');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
  const [busClass, setBusClass] = useState<'Regular' | 'Executive'>('Regular');
  const [userName, setUserName] = useState('');
  const [clock, setClock] = useState('');
  const [greeting, setGreeting] = useState('Good morning');
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const fc = await AsyncStorage.getItem('fromCity');
      const tc = await AsyncStorage.getItem('toCity');
      const sd = await AsyncStorage.getItem('selectedDate');
      const un = await AsyncStorage.getItem('userName');
      const ue = await AsyncStorage.getItem('userEmail');
      if (fc) setFrom(fc);
      if (tc) setTo(tc);
      if (sd) setDate(sd);
      if (un) setUserName(un);
      else if (ue) setUserName(ue.split('@')[0]);
      getUnreadCount().then(setUnreadCount);
      getRecentSearches().then(setRecentSearches);
      getSavedRoutes().then(setSavedRoutes);
    };
    load();
  }, []));

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
      setClock(now.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const swap = async () => {
    const tmp = from;
    setFrom(to); setTo(tmp);
    await AsyncStorage.setItem('fromCity', to);
    await AsyncStorage.setItem('toCity', tmp);
  };

  const search = async (f = from, t = to, d = date) => {
    if (f === t) { Alert.alert('Error', 'Origin and destination cannot be the same'); return; }
    const { saveSearch } = await import('../../utils/recentSearches');
    await saveSearch(f, t, d);
    router.push({ pathname: '/screens/results', params: { from: f, to: t, date: d, busClass } });
  };

  const setRoute = async (f: string, t: string) => {
    setFrom(f); setTo(t);
    await AsyncStorage.setItem('fromCity', f);
    await AsyncStorage.setItem('toCity', t);
  };

  const s = getStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{userName ? userName.split(' ')[0].charAt(0).toUpperCase() + userName.split(' ')[0].slice(1).toLowerCase() : 'Guest'} 👋</Text>
            <Text style={s.subGreeting}>{greeting}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.clock}>{clock}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.gold, borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ fontSize: 9, color: colors.bg, fontFamily: 'DMSans_500Medium' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.pill}><Text style={s.pillText}>🕐 24/7 Booking Available</Text></View>

        <View style={s.card}>
          <Text style={s.cardLabel}>WHERE ARE YOU GOING?</Text>

          <TouchableOpacity style={s.field} onPress={() => router.push({ pathname: '/screens/city-picker', params: { type: 'from' } })}>
            <Text style={{ fontSize: 18 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>FROM</Text>
              <Text style={s.fieldVal}>{from}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'flex-end', marginVertical: -4 }}>
            <TouchableOpacity style={s.swapBtn} onPress={swap}>
              <Text style={{ fontSize: 16, color: colors.bg }}>⇅</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.field, { marginTop: -4 }]} onPress={() => router.push({ pathname: '/screens/city-picker', params: { type: 'to' } })}>
            <Text style={{ fontSize: 18 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>TO</Text>
              <Text style={s.fieldVal}>{to}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.field} onPress={() => router.push('/screens/calendar')}>
            <Text style={{ fontSize: 18 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>DATE</Text>
              <Text style={s.fieldVal}>{date}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <View style={s.classRow}>
            <TouchableOpacity style={[s.classBtn, busClass === 'Regular' ? s.classBtnActive : s.classBtnOutline]} onPress={() => setBusClass('Regular')}>
              <Text style={[s.classBtnText, { color: busClass === 'Regular' ? colors.bg : colors.gold }]}>Regular</Text>
              <Text style={[s.classBtnSub, { color: busClass === 'Regular' ? colors.bg : colors.gray }]}>from GHS 80</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.classBtn, busClass === 'Executive' ? s.classBtnActive : s.classBtnOutline]} onPress={() => setBusClass('Executive')}>
              <Text style={[s.classBtnText, { color: busClass === 'Executive' ? colors.bg : colors.gold }]}>Executive</Text>
              <Text style={[s.classBtnSub, { color: busClass === 'Executive' ? colors.bg : colors.gray }]}>from GHS 150</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btnGold} onPress={() => search()}>
            <Text style={s.btnGoldText}>🔍 Search Buses</Text>
          </TouchableOpacity>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Popular Routes</Text>
          <TouchableOpacity onPress={() => router.push('/screens/all-routes')}>
            <Text style={s.link}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {POPULAR.map((r, i) => {
            const isSaved = savedRoutes.some((s) => s.from === r.from && s.to === r.to);
            return (
              <TouchableOpacity key={i} style={s.chip} onPress={() => { setRoute(r.from, r.to).then(() => search(r.from, r.to)); }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.chipRoute}>{r.from}→{r.to}</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={async (e) => {
                      e.stopPropagation();
                      if (isSaved) { await removeRoute(r.from, r.to); } else { await saveRoute(r.from, r.to); }
                      getSavedRoutes().then(setSavedRoutes);
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{isSaved ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.chipPrice}>GHS {r.price}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {savedRoutes.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>❤️ Saved Routes</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {savedRoutes.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.chip, { borderColor: colors.gold }]}
                  onPress={() => { setRoute(r.from, r.to).then(() => search(r.from, r.to)); }}
                >
                  <Text style={s.chipRoute}>{r.from}→{r.to}</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={async (e) => {
                      e.stopPropagation();
                      await removeRoute(r.from, r.to);
                      getSavedRoutes().then(setSavedRoutes);
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.text2 }}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {recentSearches.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={async () => { await clearRecentSearches(); setRecentSearches([]); }}>
                <Text style={s.link}>Clear</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((r, i) => (
              <TouchableOpacity key={i} style={s.card} onPress={() => { setRoute(r.from, r.to).then(() => search(r.from, r.to, r.date)); }}>
                <Text style={s.recentRoute}>{r.from} → {r.to}</Text>
                <Text style={s.recentMeta}>📅 {r.date}   🕐 {r.time}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  greeting: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text },
  subGreeting: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clock: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text2 },
  pill: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.gold, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 },
  pillText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10 },
  cardLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.gold, letterSpacing: 1, marginBottom: 10 },
  field: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.text2, marginBottom: 2 },
  fieldVal: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text },
  chevron: { color: colors.gray },
  swapBtn: { width: 36, height: 36, backgroundColor: colors.gold, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  classRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 10 },
  classBtn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  classBtnActive: { backgroundColor: colors.gold },
  classBtnOutline: { borderWidth: 1, borderColor: colors.gold },
  classBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  classBtnSub: { fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  chip: { backgroundColor: colors.card, borderRadius: 12, padding: 10, marginRight: 8, borderWidth: 1, borderColor: colors.fborder },
  chipRoute: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.text },
  chipPrice: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.gold },
  recentRoute: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text, marginBottom: 4 },
  recentMeta: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
});
