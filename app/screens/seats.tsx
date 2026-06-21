import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_SEATS = 32;
const BOOKED = [2, 5, 8, 11, 14, 17, 20, 23];

export default function Seats() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from: string; to: string; date: string; op: string; dep: string; arr: string; price: string }>();
  const [selected, setSelected] = useState<number | null>(null);

  const getSeatStatus = (n: number) => {
    if (BOOKED.includes(n)) return 'booked';
    if (selected === n) return 'selected';
    return 'available';
  };

  const seatStyle = (status: string) => {
    if (status === 'booked') return [styles.seat, styles.seatBooked];
    if (status === 'selected') return [styles.seat, styles.seatSelected];
    return [styles.seat, styles.seatAvailable];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{params.from} → {params.to}</Text>
            <Text style={styles.subtitle}>{params.op} · {params.dep}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.driverRow}>
            <Text style={styles.driverText}>🚌 Driver (Front)</Text>
          </View>

          <View style={styles.grid}>
            {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((n) => {
              const status = getSeatStatus(n);
              return (
                <TouchableOpacity
                  key={n}
                  style={seatStyle(status)}
                  onPress={() => status !== 'booked' && setSelected(n)}
                  disabled={status === 'booked'}
                >
                  <Text style={[styles.seatText, status === 'selected' && { color: colors.bg }]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { borderWidth: 1, borderColor: colors.navy }]} /><Text style={styles.legendText}>Available</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#1a2535' }]} /><Text style={styles.legendText}>Booked</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.gold }]} /><Text style={styles.legendText}>Selected</Text></View>
          </View>

          <TouchableOpacity
            style={[styles.btnGold, !selected && { opacity: 0.4 }]}
            disabled={!selected}
            onPress={() => router.push({ pathname: '/screens/summary', params: { ...params, seat: selected } })}
          >
            <Text style={styles.btnGoldText}>{selected ? `Confirm Seat ${selected}` : 'Select a Seat'}</Text>
          </TouchableOpacity>
        </View>
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
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14 },
  driverRow: { backgroundColor: 'rgba(27,58,107,0.4)', borderRadius: 8, padding: 7, alignItems: 'center', marginBottom: 12 },
  driverText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 },
  seat: { width: 36, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  seatAvailable: { borderWidth: 1, borderColor: colors.navy },
  seatBooked: { backgroundColor: '#1a2535', borderWidth: 1, borderColor: '#1a2535' },
  seatSelected: { backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.gold },
  seatText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.gray },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 14, height: 14, borderRadius: 3 },
  legendText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
