import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookings } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { darkColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Tickets() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const styles = getStyles(colors);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const [apiRes, localRaw] = await Promise.allSettled([
        bookings.getMine(),
        AsyncStorage.getItem('localBookings'),
      ]);
      const apiData = apiRes.status === 'fulfilled' ? (apiRes.value.data || []) : [];
      const localData = localRaw.status === 'fulfilled' && localRaw.value ? JSON.parse(localRaw.value) : [];
      setMyBookings([...localData, ...apiData]);
    } catch {
      const localRaw = await AsyncStorage.getItem('localBookings').catch(() => null);
      setMyBookings(localRaw ? JSON.parse(localRaw) : []);
    } finally {
      setLoading(false);
    }
    setTimeout(() => setLoading(false), 3000);
  };

  const filtered = myBookings.filter((b) => {
    if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (tab === 'completed') return b.status === 'completed';
    return b.status === 'cancelled';
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Tickets</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tabRow}>
          {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎫</Text>
            <Text style={styles.emptyText}>No {tab} tickets</Text>
            <TouchableOpacity style={styles.btnGold} onPress={() => router.push('/(tabs)/home')}>
              <Text style={styles.btnGoldText}>Book a Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((b, i) => (
            <TouchableOpacity
              key={i}
              style={styles.ticketCard}
              onPress={() => router.push({ pathname: '/screens/ticket-detail', params: { id: b.id } })}
            >
              <View style={styles.ticketRow}>
                <Text style={styles.route}>
                  {b.schedule?.route?.origin} → {b.schedule?.route?.destination}
                </Text>
                <View style={[styles.badge, { backgroundColor: b.status === 'confirmed' ? 'rgba(0,201,167,0.15)' : 'rgba(201,168,76,0.15)' }]}>
                  <Text style={[styles.badgeText, { color: b.status === 'confirmed' ? colors.green : colors.gold }]}>
                    {b.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                📅 {b.schedule?.departsAt?.slice(0, 10)}  💺 Seat {b.seatNumber}
              </Text>
              <View style={styles.ticketFooter}>
                <Text style={styles.amount}>GHS {parseFloat(b.totalAmount || 0).toFixed(2)}</Text>
                {b.busClass && (
                  <View style={styles.classBadge}>
                    <Text style={styles.classText}>{b.busClass.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof darkColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  tabTextActive: { color: colors.bg },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text2, marginBottom: 20 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.bg },
  ticketCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: colors.gold },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  route: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  meta: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginBottom: 6 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.gold },
  classBadge: { backgroundColor: 'rgba(27,58,107,0.4)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  classText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.text2 },
});
