import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

function QRCode() {
  return (
    <Svg width={110} height={110} viewBox="0 0 80 80">
      <Rect x={5} y={5} width={25} height={25} fill="#C9A84C" />
      <Rect x={8} y={8} width={19} height={19} fill="#fff" />
      <Rect x={11} y={11} width={13} height={13} fill="#C9A84C" />
      <Rect x={50} y={5} width={25} height={25} fill="#C9A84C" />
      <Rect x={53} y={8} width={19} height={19} fill="#fff" />
      <Rect x={56} y={11} width={13} height={13} fill="#C9A84C" />
      <Rect x={5} y={50} width={25} height={25} fill="#C9A84C" />
      <Rect x={8} y={53} width={19} height={19} fill="#fff" />
      <Rect x={11} y={56} width={13} height={13} fill="#C9A84C" />
      <Rect x={35} y={5} width={5} height={5} fill="#C9A84C" />
      <Rect x={43} y={5} width={5} height={5} fill="#C9A84C" />
      <Rect x={35} y={13} width={5} height={5} fill="#C9A84C" />
      <Rect x={43} y={13} width={5} height={5} fill="#C9A84C" />
      <Rect x={35} y={35} width={5} height={5} fill="#C9A84C" />
      <Rect x={43} y={43} width={5} height={5} fill="#C9A84C" />
      <Rect x={51} y={35} width={5} height={5} fill="#C9A84C" />
      <Rect x={59} y={43} width={5} height={5} fill="#C9A84C" />
      <Rect x={67} y={35} width={8} height={5} fill="#C9A84C" />
      <Rect x={35} y={51} width={5} height={5} fill="#C9A84C" />
      <Rect x={43} y={59} width={5} height={5} fill="#C9A84C" />
      <Rect x={59} y={51} width={5} height={5} fill="#C9A84C" />
      <Rect x={67} y={59} width={8} height={8} fill="#C9A84C" />
    </Svg>
  );
}

export default function Confirmed() {
  const router = useRouter();
  const p = useLocalSearchParams<{ from: string; to: string; date: string; op: string; dep: string; arr: string; seat: string; total: string; busClass: string }>();
  const bookingId = 'THB' + Date.now().toString().slice(-8);
  const code = `THB-2025-${(p.from || '').substring(0, 3).toUpperCase()}-${(p.to || '').substring(0, 3).toUpperCase()}-${String(p.seat).padStart(4, '0')}`;

  const shareTicket = () => {
    Share.share({ message: `TransitHub Ticket\n${p.from} → ${p.to}\nDate: ${p.date}\nDep: ${p.dep}\nSeat: ${p.seat}\nRef: ${bookingId}` });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSub}>Your ticket has been booked successfully.</Text>
        </View>

        {/* White ticket card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketTop}>
            <Text style={styles.brandName}>TransitHub</Text>
            <View style={[styles.badge, p.busClass === 'Executive' ? styles.badgeGold : styles.badgeNavy]}>
              <Text style={[styles.badgeText, { color: p.busClass === 'Executive' ? '#020E1A' : '#fff' }]}>{(p.busClass || 'REGULAR').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.bookingId}>{bookingId}</Text>
          <View style={styles.routeRow}>
            <Text style={styles.city}>{p.from}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.city}>{p.to}</Text>
          </View>
          <View style={styles.detailGrid}>
            {[
              { label: 'Date', val: p.date },
              { label: 'Time', val: p.dep },
              { label: 'Seat', val: String(p.seat) },
              { label: 'Operator', val: p.op },
            ].map((row, i) => (
              <View key={i}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailVal}>{row.val}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.qrBox}>
            <QRCode />
            <Text style={styles.qrCode}>{code}</Text>
            <Text style={styles.qrHint}>Show this at the station gate</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnOutline} onPress={shareTicket}>
            <Text style={styles.btnOutlineText}>Share Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={() => {}}>
            <Text style={styles.btnOutlineText}>Download</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnGold} onPress={() => router.push('/(tabs)/tickets')}>
          <Text style={styles.btnGoldText}>View My Tickets</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  successBanner: { alignItems: 'center', paddingVertical: 16 },
  checkCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: colors.green, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  checkMark: { fontSize: 24, color: colors.green },
  successTitle: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text, marginBottom: 4 },
  successSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  brandName: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#1B3A6B' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeNavy: { backgroundColor: '#1B3A6B' },
  badgeGold: { backgroundColor: '#C9A84C' },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  bookingId: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA', marginBottom: 10 },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  city: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: '#1B3A6B' },
  arrow: { fontSize: 18, color: '#C9A84C' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  detailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA' },
  detailVal: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#1B3A6B' },
  divider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E0', marginVertical: 12 },
  qrBox: { alignItems: 'center' },
  qrCode: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA', marginTop: 6, marginBottom: 4 },
  qrHint: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA' },
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btnOutline: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnOutlineText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.gold },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
