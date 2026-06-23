import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Summary() {
  const router = useRouter();
  const p = useLocalSearchParams<{ from: string; to: string; date: string; op: string; dep: string; arr: string; price: string; seat: string; scheduleId: string; busClass: string }>();
  const base = parseFloat(p.price || '0');
  const fee = 3;
  const total = base + fee;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Booking Summary</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={[styles.card, { alignItems: 'center' }]}>
          <View style={styles.badge}><Text style={styles.badgeText}>REGULAR</Text></View>
          <Text style={styles.route}>{p.from} → {p.to}</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Date', val: p.date },
            { label: 'Departure', val: p.dep },
            { label: 'Arrival', val: p.arr },
            { label: 'Seat', val: `Seat ${p.seat}` },
            { label: 'Operator', val: p.op },
          ].map((row, i) => (
            <View key={i} style={[styles.row, i === 4 && { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Base fare</Text><Text style={styles.priceVal}>GHS {base.toFixed(2)}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Convenience fee</Text><Text style={styles.priceVal}>GHS {fee.toFixed(2)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontSize: 17, color: colors.text }]}>Total</Text>
            <Text style={[styles.priceVal, { fontSize: 17, color: colors.gold }]}>GHS {total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnGold} onPress={() => router.push({ pathname: '/screens/payment', params: { ...p, total: total.toFixed(2) } })}>
          <Text style={styles.btnGoldText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10 },
  badge: { backgroundColor: colors.navy, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: '#fff' },
  route: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.fborder },
  rowLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  rowVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  priceVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  divider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(27,58,107,0.5)', marginVertical: 10 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
