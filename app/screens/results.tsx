import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { schedules } from '../../services/api';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// Fallback mock data when API is unreachable
const MOCK_REG = [
  { id: 'mock-r1', op: 'VIP Jeoun', dep: '06:00 AM', arr: '11:30 AM', dur: '5h 30m', seats: 12, price: 80, color: '#DC2626', abbr: 'VIP', type: 'Standard Coach' },
  { id: 'mock-r2', op: 'OA Express', dep: '09:00 AM', arr: '02:30 PM', dur: '5h 30m', seats: 23, price: 78, color: '#2563EB', abbr: 'OA', type: 'Standard Coach' },
  { id: 'mock-r3', op: 'STC Coaches', dep: '01:00 PM', arr: '06:30 PM', dur: '5h 30m', seats: 18, price: 76, color: '#7C3AED', abbr: 'STC', type: 'Standard Coach' },
  { id: 'mock-r4', op: 'Kingdom Transport', dep: '05:00 PM', arr: '10:30 PM', dur: '5h 30m', seats: 40, price: 72, color: '#0891B2', abbr: 'KT', type: 'Standard Coach' },
];
const MOCK_EXEC = [
  { id: 'mock-e1', op: 'VIP Jeoun Executive', dep: '06:00 AM', arr: '10:30 AM', dur: '4h 30m', seats: 6, price: 150, color: '#C9A84C', abbr: 'VE', type: 'Luxury Coach' },
  { id: 'mock-e2', op: 'Kingdom Executive', dep: '09:00 AM', arr: '01:30 PM', dur: '4h 30m', seats: 14, price: 145, color: '#0891B2', abbr: 'KE', type: 'Luxury Coach' },
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function addHours(dateStr: string, hours: number) {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hours);
  return d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getAbbr(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3);
}

const COLORS = ['#DC2626', '#2563EB', '#7C3AED', '#0891B2', '#C9A84C', '#16A34A', '#D97706', '#9333EA'];

export default function Results() {
  const router = useRouter();
  const { from, to, date, busClass: initClass } = useLocalSearchParams<{ from: string; to: string; date: string; busClass: string }>();
  const [tab, setTab] = useState<'Regular' | 'Executive'>((initClass as any) || 'Regular');
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [from, to, date]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await schedules.search('', date || new Date().toISOString().slice(0, 10));
      // Use origin/destination search
      const res2 = await fetch(
        `https://transithub-backend-production.up.railway.app/api/schedules/search?origin=${encodeURIComponent(from || '')}&destination=${encodeURIComponent(to || '')}&date=${date || new Date().toISOString().slice(0, 10)}`
      );
      const data = await res2.json();
      if (Array.isArray(data) && data.length > 0) {
        setAllSchedules(data);
        setUsingMock(false);
      } else {
        setUsingMock(true);
      }
    } catch {
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const toCard = (s: any, index: number) => ({
    id: s.id,
    op: s.route?.operator?.companyName || s.bus?.model || 'TransitHub',
    dep: formatTime(s.departsAt),
    arr: addHours(s.departsAt, 5),
    dur: '5h 00m',
    seats: s.bus?.capacity || 50,
    price: parseFloat(s.route?.basePrice || '80'),
    color: COLORS[index % COLORS.length],
    abbr: getAbbr(s.route?.operator?.companyName || 'TH'),
    type: s.bus?.model || 'Standard Coach',
    scheduleId: s.id,
  });

  const isExec = tab === 'Executive';
  const buses = usingMock
    ? (isExec ? MOCK_EXEC : MOCK_REG)
    : allSchedules.map(toCard);

  const displayBuses = isExec && !usingMock
    ? buses.filter((_: any, i: number) => i % 3 === 0).map((b: any) => ({ ...b, price: b.price * 1.8, type: 'Executive Coach' }))
    : buses;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{from} → {to}</Text>
            <Text style={styles.subtitle}>{date}{usingMock ? ' · Demo mode' : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Change</Text></TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {(['Regular', 'Executive'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={{ color: colors.text2, fontFamily: 'DMSans_400Regular', fontSize: 13, marginTop: 12 }}>Finding buses...</Text>
          </View>
        ) : displayBuses.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🚌</Text>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text, marginBottom: 6 }}>No buses found</Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 }}>Try a different date or route</Text>
          </View>
        ) : (
          displayBuses.map((bus: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.busCard, isExec && styles.busCardExec]}
              onPress={() => router.push({
                pathname: '/screens/seats',
                params: {
                  from, to, date,
                  op: bus.op,
                  dep: bus.dep,
                  arr: bus.arr,
                  price: String(Math.round(bus.price)),
                  seats: String(bus.seats),
                  busClass: tab,
                  scheduleId: bus.id || bus.scheduleId || '',
                }
              })}
            >
              <View style={styles.busHeader}>
                <View style={[styles.abbr, { backgroundColor: bus.color }]}>
                  <Text style={styles.abbrText}>{bus.abbr}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.opName}>{bus.op}</Text>
                  <Text style={styles.opType}>{bus.type}</Text>
                </View>
                <View style={[styles.badge, isExec ? styles.badgeGold : styles.badgeNavy]}>
                  <Text style={[styles.badgeText, { color: isExec ? colors.gold : '#fff' }]}>{tab.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.timeRow}>
                <View>
                  <Text style={styles.time}>{bus.dep}</Text>
                  <Text style={styles.city}>{from}</Text>
                </View>
                <Text style={styles.dur}>{bus.dur}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.time}>{bus.arr}</Text>
                  <Text style={styles.city}>{to}</Text>
                </View>
              </View>
              <View style={styles.seatsRow}>
                <Text style={styles.seatsText}>🪑 {bus.seats} seats available</Text>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>GHS {Math.round(bus.price)}</Text>
                  <View style={styles.selectBtn}>
                    <Text style={styles.selectBtnText}>Select</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text },
  subtitle: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  tabTextActive: { color: colors.bg },
  busCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  busCardExec: { borderWidth: 1, borderColor: colors.gold },
  busHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  abbr: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  abbrText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#fff' },
  opName: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  opType: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeNavy: { backgroundColor: colors.navy },
  badgeGold: { backgroundColor: 'rgba(201,168,76,.2)', borderWidth: 1, borderColor: colors.gold },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  time: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.text },
  city: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  dur: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  seatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seatsText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontFamily: 'DMSans_500Medium', fontSize: 17, color: colors.gold },
  selectBtn: { backgroundColor: colors.gold, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  selectBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.bg },
});
