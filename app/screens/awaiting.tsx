import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addNotification } from '../../utils/notifications';
import { scheduleTripReminders } from '../../utils/pushNotifications';
import { bookings as bookingsApi } from '../../services/api';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Awaiting() {
  const router = useRouter();
  const p = useLocalSearchParams<{ from: string; to: string; total: string; seat: string; op: string; dep: string; arr: string; date: string; busClass: string; scheduleId: string }>();
  const [seconds, setSeconds] = useState(150);
  const timerRef = useRef<any>(null);

  const saveBookingLocally = async () => {
    try {
      const displayId = 'THB' + Date.now().toString().slice(-8);
      const code = `THB-2025-${(p.from || '').substring(0, 3).toUpperCase()}-${(p.to || '').substring(0, 3).toUpperCase()}-${String(p.seat).padStart(4, '0')}`;
      const qrValue = `TRANSITHUB|${displayId}|${p.from}|${p.to}|${p.date}|${p.dep}|SEAT:${p.seat}|${code}`;

      const existing = await AsyncStorage.getItem('localBookings');
      const localBookings = existing ? JSON.parse(existing) : [];
      const newBooking = {
        id: 'LOCAL-' + Date.now(),
        status: 'confirmed',
        totalAmount: parseFloat(p.total || '0'),
        seatNumber: p.seat,
        createdAt: new Date().toISOString(),
        schedule: {
          departsAt: p.date + 'T' + (p.dep || '00:00') + ':00',
          route: { origin: p.from, destination: p.to },
        },
        operator: p.op,
        busClass: p.busClass,
        arrivalTime: p.arr,
        qrValue,
        displayId,
      };
      localBookings.unshift(newBooking);
      await AsyncStorage.setItem('localBookings', JSON.stringify(localBookings));

      // Also create on backend if scheduleId is available (non-mock)
      const scheduleId = (p as any).scheduleId;
      if (scheduleId && !scheduleId.startsWith('mock-')) {
        try {
          await bookingsApi.create(scheduleId, parseInt(p.seat), qrValue);
        } catch (_) {}
      }

      return qrValue;
    } catch (_) {
      return undefined;
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          router.replace({ pathname: '/screens/failed', params: p });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    const confirm = setTimeout(async () => {
      clearInterval(timerRef.current);
      await saveBookingLocally();
      await addNotification({ icon: '✅', bg: 'rgba(0,201,167,0.15)', title: 'Booking Confirmed!', msg: `Seat ${p.seat} on ${p.from}→${p.to} confirmed. Departs ${p.dep} on ${p.date}.`, time: 'Just now' });
      // Schedule push reminders for the trip
      try {
        const [day, time] = [p.date, p.dep];
        const departsAt = new Date(`${day}T${time?.replace(/\s?(AM|PM)/i, '') || '06:00'}:00`);
        if (!isNaN(departsAt.getTime())) {
          await scheduleTripReminders(p.from, p.to, departsAt, p.seat);
        }
      } catch (_) {}
      router.replace({ pathname: '/screens/confirmed', params: p });
    }, 3000);

    return () => { clearInterval(timerRef.current); clearTimeout(confirm); };
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = seconds / 150;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.icon}>📱</Text>
        <Text style={styles.title}>Check your phone</Text>
        <Text style={styles.sub}>Approve the payment to complete your booking.</Text>
        <Text style={styles.countdown}>Expires in {mins}:{secs.toString().padStart(2, '0')}</Text>
        <View style={styles.progTrack}>
          <View style={[styles.progFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity style={{ marginTop: 28 }} onPress={() => { clearInterval(timerRef.current); router.back(); }}>
          <Text style={styles.cancel}>Cancel Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  center: { alignItems: 'center', padding: 32 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text, marginBottom: 10 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text2, textAlign: 'center', marginBottom: 24 },
  countdown: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.gold, marginBottom: 10 },
  progTrack: { width: '100%', height: 4, backgroundColor: 'rgba(27,58,107,.4)', borderRadius: 2, overflow: 'hidden' },
  progFill: { height: 4, backgroundColor: colors.gold, borderRadius: 2 },
  cancel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
});
