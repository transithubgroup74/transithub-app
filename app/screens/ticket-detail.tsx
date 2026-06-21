import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TicketDetail() {
  const router = useRouter();
  const p = useLocalSearchParams<{ id: string; from: string; to: string; date: string; dep: string; arr: string; op: string; seat: string; status: string }>();

  const shareTicket = () => {
    Share.share({ message: `TransitHub Ticket\n${p.from} → ${p.to}\nDate: ${p.date}\nSeat: ${p.seat}\nRef: ${p.id}` });
  };

  const statusColor = p.status === 'CONFIRMED' ? colors.green : p.status === 'CANCELLED' ? colors.red : colors.gold;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Ticket Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{p.status}</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.routeRow}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.city}>{p.from}</Text>
              <Text style={styles.time}>{p.dep}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.arrow}>—✈—</Text>
              <Text style={styles.dur}>Direct</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.city}>{p.to}</Text>
              <Text style={styles.time}>{p.arr}</Text>
            </View>
          </View>

          <View style={styles.dividerDash} />

          {[
            { label: 'Booking Ref', val: p.id?.toUpperCase().substring(0, 8) ?? 'N/A' },
            { label: 'Date', val: p.date },
            { label: 'Operator', val: p.op },
            { label: 'Seat', val: `Seat ${p.seat}` },
          ].map((row, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailVal}>{row.val}</Text>
            </View>
          ))}

          <View style={styles.dividerDash} />
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>QR</Text>
            </View>
            <Text style={styles.qrHint}>Show at boarding</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnOutline} onPress={shareTicket}>
          <Text style={styles.btnOutlineText}>Share Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: 'DMSans_500Medium', fontSize: 13 },
  ticketCard: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 14 },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  city: { fontFamily: 'DMSans_500Medium', fontSize: 17, color: colors.text },
  time: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  arrow: { fontSize: 16, color: colors.gold },
  dur: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  dividerDash: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(27,58,107,0.6)', marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  detailVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  qrBox: { alignItems: 'center', paddingTop: 6 },
  qrPlaceholder: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  qrText: { fontFamily: 'Syne_700Bold', fontSize: 24, color: colors.bg },
  qrHint: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
  btnOutline: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnOutlineText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.gold },
});
