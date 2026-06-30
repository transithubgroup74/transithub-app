import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import { darkColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookings as bookingsApi } from '../../services/api';


export default function Confirmed() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const p = useLocalSearchParams<{ from: string; to: string; date: string; op: string; dep: string; arr: string; seat: string; total: string; busClass: string; qrValue?: string; displayId?: string; code?: string }>();
  // Use the SAME id/code/QR that was saved to the backend (passed from the
  // booking step), so the QR shown here matches what the conductor verifies.
  const bookingId = p.displayId || ('THB' + Date.now().toString().slice(-8));
  const code = p.code || `THB-2025-${(p.from || '').substring(0, 3).toUpperCase()}-${(p.to || '').substring(0, 3).toUpperCase()}-${String(p.seat).padStart(4, '0')}`;
  const qrValue = p.qrValue || `TRANSITHUB|${bookingId}|${p.from}|${p.to}|${p.date}|${p.dep}|SEAT:${p.seat}|${code}`;

  const ticketText = `━━━━━━━━━━━━━━━━━━━━━━
🚌 TRANSITHUB TICKET
━━━━━━━━━━━━━━━━━━━━━━
Ref: ${bookingId}
Route: ${p.from} → ${p.to}
Date: ${p.date}
Departure: ${p.dep}
Seat: ${p.seat}
Class: ${p.busClass || 'Regular'}
Operator: ${p.op}
Amount: GHS ${p.total}
━━━━━━━━━━━━━━━━━━━━━━
QR Code: ${code}
Show this at the station gate.
━━━━━━━━━━━━━━━━━━━━━━`;

  const shareTicket = () => {
    Share.share({ message: ticketText });
  };

  const downloadTicket = () => {
    Share.share({ message: ticketText, title: `TransitHub Ticket - ${bookingId}` });
  };

  const emailReceipt = async () => {
    setSendingReceipt(true);
    try {
      // Find the real booking id from localBookings
      const raw = await AsyncStorage.getItem('localBookings');
      const list = raw ? JSON.parse(raw) : [];
      const realBooking = list.find((b: any) => !b.id?.startsWith('LOCAL-'));
      if (realBooking) {
        await bookingsApi.sendReceipt(realBooking.id);
        Alert.alert('Receipt Sent', `A receipt has been sent to your registered email.`);
      } else {
        // Fallback: share via email
        Share.share({ message: ticketText, title: `TransitHub Receipt - ${bookingId}` });
      }
    } catch {
      // Fallback to share if API fails
      Share.share({ message: ticketText, title: `TransitHub Receipt - ${bookingId}` });
    } finally {
      setSendingReceipt(false);
    }
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
            <QRCode
              value={qrValue}
              size={120}
              color="#1B3A6B"
              backgroundColor="#ffffff"
            />
            <Text style={styles.qrCode}>{code}</Text>
            <Text style={styles.qrHint}>Show this at the station gate</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnOutline} onPress={shareTicket}>
            <Text style={styles.btnOutlineText}>Share Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={downloadTicket}>
            <Text style={styles.btnOutlineText}>Download</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btnOutline, { marginBottom: 8, borderColor: colors.navy }]} onPress={emailReceipt} disabled={sendingReceipt}>
          <Text style={[styles.btnOutlineText, { color: colors.text2 }]}>
            {sendingReceipt ? 'Sending...' : '📧 Email Receipt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnGold} onPress={() => router.push('/(tabs)/tickets')}>
          <Text style={styles.btnGoldText}>View My Tickets</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof darkColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  successBanner: { alignItems: 'center', paddingVertical: 16 },
  checkCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: colors.green ?? '#00C9A7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  checkMark: { fontSize: 24, color: colors.green ?? '#00C9A7' },
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
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#020E1A' },
});
