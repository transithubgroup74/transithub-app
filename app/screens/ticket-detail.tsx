import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookings as bookingsApi } from '../../services/api';
import { addNotification } from '../../utils/notifications';

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
    // Fallback: fetch from backend
    try {
      const res = await bookingsApi.getById(id as string);
      if (res.data) { setBooking(res.data); setLoading(false); return; }
    } catch (_) {}
    setLoading(false);
  };

  const shareTicket = () => {
    if (!booking) return;
    const origin = booking.schedule?.route?.origin;
    const dest = booking.schedule?.route?.destination;
    Share.share({ message: `TransitHub Ticket\n${origin} → ${dest}\nDate: ${booking.schedule?.departsAt?.slice(0, 10)}\nSeat: ${booking.seatNumber}\nRef: ${booking.id}` });
  };

  const cancelBooking = () => {
    if (booking.status === 'cancelled') return;
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel on backend if it's a real booking
              if (!booking.id?.startsWith('LOCAL-')) {
                await bookingsApi.cancel(booking.id);
              }
              // Update local copy
              const raw = await AsyncStorage.getItem('localBookings');
              if (raw) {
                const list = JSON.parse(raw);
                const updated = list.map((b: any) =>
                  b.id === booking.id ? { ...b, status: 'cancelled' } : b
                );
                await AsyncStorage.setItem('localBookings', JSON.stringify(updated));
              }
              setBooking({ ...booking, status: 'cancelled' });
              await addNotification({
                icon: '❌',
                bg: 'rgba(239,68,68,0.15)',
                title: 'Booking Cancelled',
                msg: `Your booking for ${booking.schedule?.route?.origin} → ${booking.schedule?.route?.destination} has been cancelled.`,
                time: 'Just now',
              });
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'Could not cancel booking. Try again.');
            }
          },
        },
      ]
    );
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
            <QRCode
              value={booking.qrValue || booking.qrCode || `TRANSITHUB|${booking.id}|${origin}|${dest}|${date}|${dep}|SEAT:${booking.seatNumber}|THB-${ref}`}
              size={120}
              color="#1B3A6B"
              backgroundColor="#ffffff"
            />
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

        {booking.status !== 'cancelled' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelBooking}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
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
  cancelBtn: { marginTop: 8, borderWidth: 1, borderColor: colors.red ?? '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.red ?? '#EF4444' },
});
