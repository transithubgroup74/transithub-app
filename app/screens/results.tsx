import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { schedules } from '../../services/api';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_REG = [
  // Early Morning (12am–6am)
  { id: 'mock-r0a', op: 'Night Rider Express', dep: '02:00 AM', arr: '07:30 AM', dur: '5h 30m', seats: 30, price: 68, color: '#1E40AF', abbr: 'NR', type: 'Standard Coach' },
  { id: 'mock-r0b', op: 'STC Coaches', dep: '04:30 AM', arr: '10:00 AM', dur: '5h 30m', seats: 22, price: 70, color: '#7C3AED', abbr: 'STC', type: 'Standard Coach' },
  // Morning (6am–12pm)
  { id: 'mock-r1', op: 'VIP Jeoun', dep: '06:00 AM', arr: '11:30 AM', dur: '5h 30m', seats: 12, price: 80, color: '#DC2626', abbr: 'VIP', type: 'Standard Coach' },
  { id: 'mock-r2', op: 'OA Express', dep: '09:00 AM', arr: '02:30 PM', dur: '5h 30m', seats: 23, price: 78, color: '#2563EB', abbr: 'OA', type: 'Standard Coach' },
  { id: 'mock-r2b', op: 'Kingdom Transport', dep: '11:00 AM', arr: '04:30 PM', dur: '5h 30m', seats: 35, price: 75, color: '#0891B2', abbr: 'KT', type: 'Standard Coach' },
  // Afternoon (12pm–6pm)
  { id: 'mock-r3', op: 'STC Coaches', dep: '01:00 PM', arr: '06:30 PM', dur: '5h 30m', seats: 18, price: 76, color: '#7C3AED', abbr: 'STC', type: 'Standard Coach' },
  { id: 'mock-r3b', op: 'OA Express', dep: '03:30 PM', arr: '09:00 PM', dur: '5h 30m', seats: 27, price: 74, color: '#2563EB', abbr: 'OA', type: 'Standard Coach' },
  { id: 'mock-r4', op: 'Kingdom Transport', dep: '05:00 PM', arr: '10:30 PM', dur: '5h 30m', seats: 40, price: 72, color: '#0891B2', abbr: 'KT', type: 'Standard Coach' },
  // Evening (6pm–12am)
  { id: 'mock-r5', op: 'VIP Jeoun', dep: '07:00 PM', arr: '12:30 AM', dur: '5h 30m', seats: 15, price: 78, color: '#DC2626', abbr: 'VIP', type: 'Standard Coach' },
  { id: 'mock-r6', op: 'Night Rider Express', dep: '09:30 PM', arr: '03:00 AM', dur: '5h 30m', seats: 32, price: 65, color: '#1E40AF', abbr: 'NR', type: 'Standard Coach' },
];
const MOCK_EXEC = [
  // Early Morning
  { id: 'mock-e0', op: 'VIP Jeoun Executive', dep: '04:00 AM', arr: '08:30 AM', dur: '4h 30m', seats: 4, price: 160, color: '#C9A84C', abbr: 'VE', type: 'Luxury Coach' },
  // Morning
  { id: 'mock-e1', op: 'VIP Jeoun Executive', dep: '06:00 AM', arr: '10:30 AM', dur: '4h 30m', seats: 6, price: 150, color: '#C9A84C', abbr: 'VE', type: 'Luxury Coach' },
  { id: 'mock-e2', op: 'Kingdom Executive', dep: '09:00 AM', arr: '01:30 PM', dur: '4h 30m', seats: 14, price: 145, color: '#0891B2', abbr: 'KE', type: 'Luxury Coach' },
  // Afternoon
  { id: 'mock-e3', op: 'Kingdom Executive', dep: '01:00 PM', arr: '05:30 PM', dur: '4h 30m', seats: 10, price: 148, color: '#0891B2', abbr: 'KE', type: 'Luxury Coach' },
  { id: 'mock-e4', op: 'VIP Jeoun Executive', dep: '04:00 PM', arr: '08:30 PM', dur: '4h 30m', seats: 8, price: 152, color: '#C9A84C', abbr: 'VE', type: 'Luxury Coach' },
  // Evening
  { id: 'mock-e5', op: 'Kingdom Executive', dep: '07:30 PM', arr: '12:00 AM', dur: '4h 30m', seats: 6, price: 140, color: '#0891B2', abbr: 'KE', type: 'Luxury Coach' },
];

const TIME_SLOTS = [
  { label: 'Early Morning', sub: '12am – 6am', from: 0, to: 6 },
  { label: 'Morning', sub: '6am – 12pm', from: 6, to: 12 },
  { label: 'Afternoon', sub: '12pm – 6pm', from: 12, to: 18 },
  { label: 'Evening', sub: '6pm – 12am', from: 18, to: 24 },
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
function depHour(dep: string) {
  const match = dep.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h;
}

const COLORS = ['#DC2626', '#2563EB', '#7C3AED', '#0891B2', '#C9A84C', '#16A34A', '#D97706', '#9333EA'];

export default function Results() {
  const router = useRouter();
  const { from, to, date, busClass: initClass } = useLocalSearchParams<{ from: string; to: string; date: string; busClass: string }>();
  const [tab, setTab] = useState<'Regular' | 'Executive'>((initClass as any) || 'Regular');
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [timeSlot, setTimeSlot] = useState<number | null>(null);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('time');

  useEffect(() => { loadSchedules(); }, [from, to, date]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
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
    op: s.route?.operator?.companyName || 'TransitHub',
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
  const rawBuses = usingMock
    ? (isExec ? MOCK_EXEC : MOCK_REG)
    : (isExec
        ? allSchedules.map(toCard).filter((_: any, i: number) => i % 3 === 0).map((b: any) => ({ ...b, price: b.price * 1.8, type: 'Executive Coach' }))
        : allSchedules.map(toCard));

  // Unique operators for filter
  const operators = useMemo(() => [...new Set(rawBuses.map((b: any) => b.op))], [rawBuses]);
  const prices = useMemo(() => rawBuses.map((b: any) => b.price), [rawBuses]);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 500;

  const PRICE_STEPS = [
    { label: 'Any', val: null },
    { label: `≤ GHS ${Math.round(minP + (maxP - minP) * 0.33)}`, val: Math.round(minP + (maxP - minP) * 0.33) },
    { label: `≤ GHS ${Math.round(minP + (maxP - minP) * 0.66)}`, val: Math.round(minP + (maxP - minP) * 0.66) },
    { label: `≤ GHS ${Math.round(maxP)}`, val: Math.round(maxP) },
  ];

  const displayBuses = useMemo(() => {
    let list = [...rawBuses];
    // Filter out past departures when searching for today
    const now = new Date();
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const dateLower = (date || '').toLowerCase();
    const isToday = (() => {
      // Try ISO format first
      if (date === now.toISOString().slice(0, 10)) return true;
      // Check day, month name, and year all appear in the date string
      const d = now.getDate().toString();
      const m = months[now.getMonth()];
      const y = now.getFullYear().toString();
      return dateLower.includes(d) && dateLower.includes(m) && dateLower.includes(y);
    })();
    if (isToday) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      list = list.filter((b: any) => {
        const match = b.dep.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return true;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + m > nowMinutes;
      });
    }
    if (timeSlot !== null) {
      const slot = TIME_SLOTS[timeSlot];
      list = list.filter((b: any) => { const h = depHour(b.dep); return h >= slot.from && h < slot.to; });
    }
    if (selectedOp) list = list.filter((b: any) => b.op === selectedOp);
    if (maxPrice !== null) list = list.filter((b: any) => b.price <= maxPrice);
    list.sort((a: any, b: any) => sortBy === 'price' ? a.price - b.price : depHour(a.dep) - depHour(b.dep));
    return list;
  }, [rawBuses, timeSlot, selectedOp, maxPrice, sortBy, date]);

  const activeFilters = [timeSlot !== null, selectedOp !== null, maxPrice !== null].filter(Boolean).length;

  const clearFilters = () => { setTimeSlot(null); setSelectedOp(null); setMaxPrice(null); setSortBy('time'); };

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

        {/* Filter / Sort bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]} onPress={() => setShowFilters(true)}>
            <Text style={[styles.filterBtnText, activeFilters > 0 && { color: colors.bg }]}>
              ⚙ Filter{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortBtn, sortBy === 'price' && styles.sortBtnActive]} onPress={() => setSortBy(sortBy === 'price' ? 'time' : 'price')}>
            <Text style={[styles.sortBtnText, sortBy === 'price' && { color: colors.gold }]}>
              {sortBy === 'price' ? '↑ Price' : '↑ Time'}
            </Text>
          </TouchableOpacity>
          {activeFilters > 0 && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={{ color: colors.text2, fontFamily: 'DMSans_400Regular', fontSize: 13, marginTop: 12 }}>Finding buses...</Text>
          </View>
        ) : displayBuses.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🚌</Text>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text, marginBottom: 6 }}>No buses match your filters</Text>
            <TouchableOpacity onPress={clearFilters}><Text style={{ color: colors.gold, fontFamily: 'DMSans_500Medium', fontSize: 13 }}>Clear Filters</Text></TouchableOpacity>
          </View>
        ) : (
          displayBuses.map((bus: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.busCard, isExec && styles.busCardExec]}
              onPress={() => router.push({
                pathname: '/screens/seats',
                params: { from, to, date, op: bus.op, dep: bus.dep, arr: bus.arr, price: String(Math.round(bus.price)), seats: String(bus.seats), busClass: tab, scheduleId: bus.id || bus.scheduleId || '' },
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
                  <View style={styles.selectBtn}><Text style={styles.selectBtnText}>Select</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Filter Sheet */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilters(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>Filter Results</Text>

            <Text style={styles.filterLabel}>Departure Time</Text>
            <View style={styles.chipRow}>
              {TIME_SLOTS.map((slot, i) => (
                <TouchableOpacity key={i} style={[styles.chip, timeSlot === i && styles.chipActive]} onPress={() => setTimeSlot(timeSlot === i ? null : i)}>
                  <Text style={[styles.chipText, timeSlot === i && styles.chipTextActive]}>{slot.label}</Text>
                  <Text style={[styles.chipSub, timeSlot === i && { color: colors.bg }]}>{slot.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Operator</Text>
            <View style={styles.chipRow}>
              {operators.map((op: string, i: number) => (
                <TouchableOpacity key={i} style={[styles.chip, selectedOp === op && styles.chipActive]} onPress={() => setSelectedOp(selectedOp === op ? null : op)}>
                  <Text style={[styles.chipText, selectedOp === op && styles.chipTextActive]}>{op}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Max Price</Text>
            <View style={styles.chipRow}>
              {PRICE_STEPS.map((step, i) => (
                <TouchableOpacity key={i} style={[styles.chip, maxPrice === step.val && styles.chipActive]} onPress={() => setMaxPrice(step.val)}>
                  <Text style={[styles.chipText, maxPrice === step.val && styles.chipTextActive]}>{step.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.chipRow}>
              {(['time', 'price'] as const).map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, sortBy === s && styles.chipActive]} onPress={() => setSortBy(s)}>
                  <Text style={[styles.chipText, sortBy === s && styles.chipTextActive]}>{s === 'time' ? 'Departure Time' : 'Lowest Price'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyBtnText}>Show {displayBuses.length} Result{displayBuses.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
            {activeFilters > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { clearFilters(); setShowFilters(false); }}>
                <Text style={styles.clearBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  tabTextActive: { color: colors.bg },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  filterBtnActive: { backgroundColor: colors.gold },
  filterBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  sortBtn: { borderWidth: 1, borderColor: colors.fborder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  sortBtnActive: { borderColor: colors.gold },
  sortBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.text2 },
  clearText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
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
  // Modal / sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: colors.fborder, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text, marginBottom: 16 },
  filterLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold, letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.fborder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.text },
  chipTextActive: { color: colors.bg },
  chipSub: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.text2, marginTop: 1 },
  applyBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  applyBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  clearBtn: { alignItems: 'center', marginTop: 10, paddingVertical: 10 },
  clearBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
});
