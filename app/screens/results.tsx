import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const REG_BUSES = [
  { op: 'VIP Bus Service', dep: '05:00 AM', arr: '10:30 AM', dur: '5h 30m', seats: 12, price: 80, color: '#DC2626', abbr: 'VIP', type: 'Standard Coach' },
  { op: 'GPRTU', dep: '06:30 AM', arr: '12:00 PM', dur: '5h 30m', seats: 8, price: 75, color: '#D97706', abbr: 'GP', type: 'Standard Coach' },
  { op: 'OA Travel & Tours', dep: '08:00 AM', arr: '01:30 PM', dur: '5h 30m', seats: 23, price: 78, color: '#2563EB', abbr: 'OA', type: 'Standard Coach' },
  { op: 'Metro Mass Transit', dep: '10:00 AM', arr: '03:30 PM', dur: '5h 30m', seats: 31, price: 70, color: '#16A34A', abbr: 'MM', type: 'Standard Coach' },
  { op: 'Intercity STC', dep: '12:00 PM', arr: '05:30 PM', dur: '5h 30m', seats: 18, price: 76, color: '#7C3AED', abbr: 'STC', type: 'Standard Coach' },
  { op: 'Neoplan Ghana', dep: '02:00 PM', arr: '07:30 PM', dur: '5h 30m', seats: 40, price: 72, color: '#0891B2', abbr: 'NEO', type: 'Standard Coach' },
];

const EXEC_BUSES = [
  { op: 'VIP Jeoun Executive', dep: '06:00 AM', arr: '10:30 AM', dur: '4h 30m', seats: 6, price: 150, color: '#C9A84C', abbr: 'VE', type: 'Luxury Coach' },
  { op: 'STC Luxury', dep: '07:30 AM', arr: '12:00 PM', dur: '4h 30m', seats: 4, price: 160, color: '#7C3AED', abbr: 'SL', type: 'Luxury Coach' },
  { op: 'Kingdom Transport', dep: '09:00 AM', arr: '01:30 PM', dur: '4h 30m', seats: 14, price: 145, color: '#0891B2', abbr: 'KT', type: 'Luxury Coach' },
  { op: 'Dreamway Transport', dep: '11:00 AM', arr: '03:30 PM', dur: '4h 30m', seats: 9, price: 155, color: '#9333EA', abbr: 'DT', type: 'Luxury Coach' },
];

export default function Results() {
  const router = useRouter();
  const { from, to, date, busClass: initClass } = useLocalSearchParams<{ from: string; to: string; date: string; busClass: string }>();
  const [tab, setTab] = useState<'Regular' | 'Executive'>((initClass as any) || 'Regular');

  const buses = tab === 'Regular' ? REG_BUSES : EXEC_BUSES;
  const isExec = tab === 'Executive';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{from} → {to}</Text>
            <Text style={styles.subtitle}>{date}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Change</Text></TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'Regular' && styles.tabActive]} onPress={() => setTab('Regular')}>
            <Text style={[styles.tabText, tab === 'Regular' && styles.tabTextActive]}>Regular</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'Executive' && styles.tabActive]} onPress={() => setTab('Executive')}>
            <Text style={[styles.tabText, tab === 'Executive' && styles.tabTextActive]}>Executive</Text>
          </TouchableOpacity>
        </View>

        {buses.map((bus, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.busCard, isExec && styles.busCardExec]}
            onPress={() => router.push({ pathname: '/screens/seats', params: { from, to, date, op: bus.op, dep: bus.dep, arr: bus.arr, price: String(bus.price), seats: String(bus.seats), busClass: tab } })}
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
              <Text style={styles.seatsText}>🪑 {bus.seats} seats left</Text>
              <View style={styles.priceBlock}>
                <Text style={styles.price}>GHS {bus.price}</Text>
                <View style={styles.selectBtn}>
                  <Text style={styles.selectBtnText}>Select</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
