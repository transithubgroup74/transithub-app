import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookings } from '../../services/api';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Seats() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    from: string; to: string; date: string; op: string; dep: string;
    arr: string; price: string; seats: string; busClass: string; scheduleId: string;
  }>();

  const totalSeats = parseInt(params.seats || '50', 10);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.scheduleId && !params.scheduleId.startsWith('mock-')) {
      bookings.getBookedSeats(params.scheduleId)
        .then((res) => setBookedSeats(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params.scheduleId]);

  const getStatus = (n: number) => {
    if (bookedSeats.includes(n)) return 'booked';
    if (selected === n) return 'selected';
    return 'available';
  };

  // Build rows of 4 seats: [1,2, aisle, 3,4], [5,6, aisle, 7,8] ...
  const rows: number[][] = [];
  for (let i = 0; i < totalSeats; i += 4) {
    rows.push([i + 1, i + 2, i + 3, i + 4].filter((n) => n <= totalSeats));
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
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
          {/* Windshield */}
          <View style={styles.windshield}>
            <Text style={styles.windshieldText}>🚌 Driver</Text>
          </View>

          {/* Column headers */}
          <View style={styles.colHeaders}>
            <Text style={styles.colLabel}>A</Text>
            <Text style={styles.colLabel}>B</Text>
            <View style={styles.aisleGap} />
            <Text style={styles.colLabel}>C</Text>
            <Text style={styles.colLabel}>D</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />
          ) : (
            rows.map((row, ri) => (
              <View key={ri} style={styles.row}>
                <Text style={styles.rowNum}>{ri + 1}</Text>
                {/* Left pair */}
                <View style={styles.pair}>
                  {row.slice(0, 2).map((n) => {
                    const status = getStatus(n);
                    return (
                      <TouchableOpacity
                        key={n}
                        style={[styles.seat, seatBg(status)]}
                        onPress={() => status !== 'booked' && setSelected(n)}
                        disabled={status === 'booked'}
                      >
                        <Text style={[styles.seatText, status === 'selected' && { color: colors.bg }]}>{n}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Aisle */}
                <View style={styles.aisle} />
                {/* Right pair */}
                <View style={styles.pair}>
                  {row.slice(2).map((n) => {
                    const status = getStatus(n);
                    return (
                      <TouchableOpacity
                        key={n}
                        style={[styles.seat, seatBg(status)]}
                        onPress={() => status !== 'booked' && setSelected(n)}
                        disabled={status === 'booked'}
                      >
                        <Text style={[styles.seatText, status === 'selected' && { color: colors.bg }]}>{n}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { borderWidth: 1, borderColor: colors.navy }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1a2535' }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>

          {/* Summary bar */}
          {selected && (
            <View style={styles.summaryBar}>
              <View>
                <Text style={styles.summaryLabel}>Selected Seat</Text>
                <Text style={styles.summaryVal}>Seat {selected}</Text>
              </View>
              <Text style={styles.summaryPrice}>GHS {params.price}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnGold, !selected && { opacity: 0.4 }]}
            disabled={!selected}
            onPress={() =>
              router.push({
                pathname: '/screens/summary',
                params: { ...params, seat: selected },
              })
            }
          >
            <Text style={styles.btnGoldText}>
              {selected ? `Confirm Seat ${selected} — GHS ${params.price}` : 'Select a Seat'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function seatBg(status: string) {
  if (status === 'booked') return styles.seatBooked;
  if (status === 'selected') return styles.seatSelected;
  return styles.seatAvailable;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text },
  subtitle: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14 },
  windshield: { backgroundColor: 'rgba(27,58,107,0.5)', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 14 },
  windshieldText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  colHeaders: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8, paddingLeft: 22 },
  colLabel: { width: 36, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.gold },
  aisleGap: { width: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowNum: { width: 16, fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.text2, marginRight: 6, textAlign: 'right' },
  pair: { flexDirection: 'row', gap: 6 },
  aisle: { width: 20 },
  seat: { width: 36, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  seatAvailable: { borderWidth: 1, borderColor: colors.navy },
  seatBooked: { backgroundColor: '#1a2535', borderWidth: 1, borderColor: '#1a2535' },
  seatSelected: { backgroundColor: colors.gold },
  seatText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.gray },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 14, height: 14, borderRadius: 3 },
  legendText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: 10, padding: 12, marginBottom: 10 },
  summaryLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  summaryVal: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text },
  summaryPrice: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.gold },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
