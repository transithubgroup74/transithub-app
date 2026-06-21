import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

function QRCode() {
  return (
    <Svg width={110} height={110} viewBox="0 0 80 80">
      <Rect x={5} y={5} width={25} height={25} fill="#C9A84C" />
      <Rect x={8} y={8} width={19} height={19} fill="#020E1A" />
      <Rect x={11} y={11} width={13} height={13} fill="#C9A84C" />
      <Rect x={50} y={5} width={25} height={25} fill="#C9A84C" />
      <Rect x={53} y={8} width={19} height={19} fill="#020E1A" />
      <Rect x={56} y={11} width={13} height={13} fill="#C9A84C" />
      <Rect x={5} y={50} width={25} height={25} fill="#C9A84C" />
      <Rect x={8} y={53} width={19} height={19} fill="#020E1A" />
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

export default function TicketDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      const raw = await AsyncStorage.getItem('localBookings');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((b: any) => b.id === id);
        if (found) { setBooking(found); setLoading(false); return; }
      }
    } catch (_) {}
    setLoading(false);
  };

  const shareTicket = () => {
    if (!booking) return;
    const origin = booking.schedule?.route?.origin;
    const dest = booking.schedule?.route?.destination;
    Share.share({ message: `TransitHub Ticket\n${origin} → ${dest}\nDate: ${booking.schedule?.departsAt?.slice(0, 10)}\nSeat: ${booking.seatNumber}\nRef: ${booking.id}` });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.gold} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Ticket Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🎫</Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text2 }}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const origin = booking.schedule?.route?.origin ?? '—';
  const dest = booking.schedule?.route?.destination ?? '—';
  const date = booking.schedule?.departsAt?.slice(0, 10) ?? '—';
  const dep = booking.schedule?.departsAt?.slice(11, 16) ?? booking.operator ?? '—';
  const ref = booking.id?.toUpperCase().slice(-8) ?? 'N/A';
  const statusColor = booking.status === 'confirmed' ? colors.green : booking.status === 'cancelled' ? colors.red : colors.gold;

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
          <Text style={[styles.statusText, { color: statusColor }]}>{booking.status.toUpperCase()}</Text>
        </View>

        {/* White ticket card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketTop}>
            <Text style={styles.brandName}>TransitHub</Text>
            {booking.busClass && (
              <View style={[styles.classBadge, booking.busClass === 'Executive' ? styles.badgeGold : styles.badgeNavy]}>
                <Text style={[styles.classText, { color: booking.busClass === 'Executive' ? '#020E1A' : '#fff' }]}>
                  {booking.busClass.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.bookingRef}>Ref: {ref}</Text>

          <View style={styles.routeRow}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.city}>{origin}</Text>
              <Text style={styles.timeLabel}>{dep}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.city}>{dest}</Text>
              <Text style={styles.timeLabel}>{booking.arrivalTime ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {[
            { label: 'Date', val: date },
            { label: 'Seat', val: `Seat ${booking.seatNumber}` },
            { label: 'Amount', val: `GHS ${parseFloat(booking.totalAmount || 0).toFixed(2)}` },
            { label: 'Operator', val: booking.operator ?? 'N/A' },
          ].map((row, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailVal}>{row.val}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.qrBox}>
            <QRCode />
            <Text style={styles.qrCode}>THB-{ref}</Text>
            <Text style={styles.qrHint}>Show at the station gate</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnOutline} onPress={shareTicket}>
          <Text style={styles.btnOutlineText}>Share Ticket</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnOutline, { marginTop: 8, borderColor: colors.navy }]} onPress={() => router.push('/(tabs)/home' as any)}>
          <Text style={[styles.btnOutlineText, { color: colors.text2 }]}>Book Another Trip</Text>
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: 'DMSans_500Medium', fontSize: 13 },
  ticketCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  brandName: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#1B3A6B' },
  classBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeNavy: { backgroundColor: '#1B3A6B' },
  badgeGold: { backgroundColor: '#C9A84C' },
  classText: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  bookingRef: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA', marginBottom: 12 },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  city: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: '#1B3A6B' },
  timeLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#6B85AA' },
  arrow: { fontSize: 20, color: '#C9A84C' },
  divider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E0', marginVertical: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#6B85AA' },
  detailVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#1B3A6B' },
  qrBox: { alignItems: 'center', paddingTop: 4 },
  qrCode: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA', marginTop: 6, marginBottom: 4 },
  qrHint: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B85AA' },
  btnOutline: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnOutlineText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.gold },
});
